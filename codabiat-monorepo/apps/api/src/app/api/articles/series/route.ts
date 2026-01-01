import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase, ArticleSeries } from '@codabiat/database';
import { withAuth } from '@codabiat/auth';
import { handleCors, handleOptions } from '../../../../lib/cors';

// OPTIONS /api/articles/series
export async function OPTIONS() {
  return handleOptions();
}

// GET /api/articles/series - Get all article series
export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const [series, total] = await Promise.all([
      ArticleSeries.find()
        .populate('author', 'name email avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      ArticleSeries.countDocuments(),
    ]);

    const response = NextResponse.json({
      success: true,
      data: series,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
    return handleCors(response);
  } catch (error) {
    console.error('Get article series error:', error);
    const response = NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
    return handleCors(response);
  }
}

// POST /api/articles/series - Create article series
export const POST = withAuth(async (req) => {
  try {
    await connectToDatabase();

    const body = await req.json();
    const { title, titleEn, description, slug, coverImage } = body;

    if (!title || !description || !slug) {
      const response = NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
      return handleCors(response);
    }

    // Check if slug already exists
    const existing = await ArticleSeries.findOne({ slug });
    if (existing) {
      const response = NextResponse.json(
        { error: 'Series with this slug already exists' },
        { status: 400 }
      );
      return handleCors(response);
    }

    const series = await ArticleSeries.create({
      title,
      titleEn,
      description,
      slug: slug.toLowerCase(),
      coverImage,
      author: req.user!.userId,
    });

    await series.populate('author', 'name email avatar');

    const response = NextResponse.json(
      {
        success: true,
        data: series,
      },
      { status: 201 }
    );
    return handleCors(response);
  } catch (error) {
    console.error('Create article series error:', error);
    const response = NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
    return handleCors(response);
  }
});
