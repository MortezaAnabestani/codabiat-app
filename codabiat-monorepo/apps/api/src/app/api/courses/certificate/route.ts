import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@codabiat/database';
import { verifyToken } from '@codabiat/auth';
import { handleCors, handleOptions } from '../../../../lib/cors';
import crypto from 'crypto';

const getCertificate = async () => {
  const { default: Certificate } = await import('@codabiat/database/src/lib/models/Certificate');
  return Certificate;
};

const getProgress = async () => {
  const { default: CourseProgress } = await import('@codabiat/database/src/lib/models/CourseProgress');
  return CourseProgress;
};

export async function OPTIONS() {
  return handleOptions();
}

// Issue certificate
export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return handleCors(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }));
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    await connectToDatabase();
    const Certificate = await getCertificate();
    const CourseProgress = await getProgress();

    const { courseId } = await req.json();

    // Check if course is completed
    const progress = await CourseProgress.findOne({
      user: decoded.userId,
      course: courseId,
    });

    if (!progress || progress.overallProgress < 100) {
      return handleCors(
        NextResponse.json({ error: 'Course not completed yet' }, { status: 400 })
      );
    }

    // Check if certificate already exists
    let certificate = await Certificate.findOne({
      user: decoded.userId,
      course: courseId,
    });

    if (!certificate) {
      // Generate unique certificate ID
      const certificateId = crypto.randomBytes(16).toString('hex').toUpperCase();

      certificate = await Certificate.create({
        user: decoded.userId,
        course: courseId,
        certificateId,
      });

      // Mark in progress
      progress.certificateIssued = true;
      await progress.save();
    }

    await certificate.populate([
      { path: 'user', select: 'name email' },
      { path: 'course', select: 'title titleEn' },
    ]);

    return handleCors(NextResponse.json({ success: true, certificate }));
  } catch (error: any) {
    console.error('Issue certificate error:', error);
    return handleCors(NextResponse.json({ error: 'Internal server error' }, { status: 500 }));
  }
}

// Get user's certificates
export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return handleCors(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }));
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    await connectToDatabase();
    const Certificate = await getCertificate();

    const certificates = await Certificate.find({ user: decoded.userId })
      .populate('course', 'title titleEn coverImage')
      .sort('-issuedAt')
      .lean();

    return handleCors(NextResponse.json({ success: true, certificates }));
  } catch (error: any) {
    console.error('Get certificates error:', error);
    return handleCors(NextResponse.json({ error: 'Internal server error' }, { status: 500 }));
  }
}
