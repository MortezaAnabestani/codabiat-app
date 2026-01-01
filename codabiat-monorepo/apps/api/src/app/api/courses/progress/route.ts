import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@codabiat/database';
import { verifyToken } from '@codabiat/auth';
import { handleCors, handleOptions } from '../../../../lib/cors';

const getProgress = async () => {
  const { default: CourseProgress } = await import('@codabiat/database/src/lib/models/CourseProgress');
  return CourseProgress;
};

export async function OPTIONS() {
  return handleOptions();
}

// Update lesson progress
export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return handleCors(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }));
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    await connectToDatabase();
    const CourseProgress = await getProgress();

    const { courseId, moduleId, lessonId } = await req.json();

    let progress = await CourseProgress.findOne({
      user: decoded.userId,
      course: courseId,
    });

    if (!progress) {
      progress = await CourseProgress.create({
        user: decoded.userId,
        course: courseId,
        modules: [],
        overallProgress: 0,
      });
    }

    // Mark lesson as completed
    let module = progress.modules.find((m: any) => m.moduleId === moduleId);
    if (!module) {
      module = { moduleId, lessons: [], completed: false };
      progress.modules.push(module);
    }

    const lesson = module.lessons.find((l: any) => l.lessonId === lessonId);
    if (lesson) {
      lesson.completed = true;
      lesson.completedAt = new Date();
    } else {
      module.lessons.push({
        lessonId,
        completed: true,
        completedAt: new Date(),
        timeSpent: 0,
      });
    }

    // Recalculate progress
    const totalLessons = progress.modules.reduce((sum: number, m: any) => sum + m.lessons.length, 0);
    const completedLessons = progress.modules.reduce(
      (sum: number, m: any) => sum + m.lessons.filter((l: any) => l.completed).length,
      0
    );
    progress.overallProgress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

    if (progress.overallProgress === 100 && !progress.completedAt) {
      progress.completedAt = new Date();
    }

    progress.lastAccessedAt = new Date();
    await progress.save();

    return handleCors(NextResponse.json({ success: true, progress }));
  } catch (error: any) {
    console.error('Update progress error:', error);
    return handleCors(NextResponse.json({ error: 'Internal server error' }, { status: 500 }));
  }
}

// Get user progress for a course
export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return handleCors(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }));
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    await connectToDatabase();
    const CourseProgress = await getProgress();

    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get('courseId');

    if (!courseId) {
      return handleCors(NextResponse.json({ error: 'courseId required' }, { status: 400 }));
    }

    const progress = await CourseProgress.findOne({
      user: decoded.userId,
      course: courseId,
    }).lean();

    return handleCors(NextResponse.json({ success: true, progress: progress || null }));
  } catch (error: any) {
    console.error('Get progress error:', error);
    return handleCors(NextResponse.json({ error: 'Internal server error' }, { status: 500 }));
  }
}
