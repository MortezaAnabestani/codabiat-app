import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase, Course } from '@codabiat/database';
import { handleCors, handleOptions } from '../../../../lib/cors';

export async function OPTIONS() {
  return handleOptions();
}

// GET single course with full details
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();

    const course = await Course.findById(params.id)
      .populate('instructor', 'name email avatar')
      .lean();

    if (!course) {
      const response = NextResponse.json({ error: 'Course not found' }, { status: 404 });
      return handleCors(response);
    }

    const response = NextResponse.json({
      success: true,
      data: course,
    });
    return handleCors(response);
  } catch (error) {
    console.error('Get course error:', error);
    const response = NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    return handleCors(response);
  }
}
