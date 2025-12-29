import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase, Course } from '@codabiat/database';
import { withAuth } from '@codabiat/auth';

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const level = searchParams.get('level');
    const published = searchParams.get('published');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const query: any = {};
    if (category) query.category = category;
    if (level) query.level = level;
    if (published) query.published = published === 'true';

    const skip = (page - 1) * limit;

    const [courses, total] = await Promise.all([
      Course.find(query)
        .populate('instructor', 'name email avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Course.countDocuments(query),
    ]);

    return NextResponse.json({
      success: true,
      data: courses,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get courses error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const POST = withAuth(async (req) => {
  try {
    await connectToDatabase();

    const body = await req.json();
    const {
      title,
      titleEn,
      description,
      descriptionEn,
      level,
      category,
      techStack,
      modules,
      coverImage,
    } = body;

    if (!title || !description || !level || !category) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const course = await Course.create({
      title,
      titleEn,
      description,
      descriptionEn,
      level,
      category,
      techStack: techStack || [],
      modules: modules || [],
      coverImage,
      instructor: req.user!.userId,
      published: false,
    });

    await course.populate('instructor', 'name email avatar');

    return NextResponse.json(
      {
        success: true,
        data: course,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create course error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});
