import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase, ArticleSeries, Article } from '@codabiat/database';
import { withAuth } from '@codabiat/auth';
import { handleCors, handleOptions } from '../../../../../lib/cors';

// OPTIONS /api/articles/series/[slug]
export async function OPTIONS() {
  return handleOptions();
}

// GET /api/articles/series/[slug] - Get series with articles
export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    await connectToDatabase();

    const series = await ArticleSeries.findOne({ slug: params.slug })
      .populate('author', 'name email avatar')
      .lean();

    if (!series) {
      const response = NextResponse.json(
        { error: 'Series not found' },
        { status: 404 }
      );
      return handleCors(response);
    }

    // Get all articles in this series
    const articles = await Article.find({ series: series._id })
      .populate('author', 'name email avatar')
      .sort({ seriesOrder: 1, createdAt: 1 })
      .lean();

    const response = NextResponse.json({
      success: true,
      data: {
        series,
        articles,
      },
    });
    return handleCors(response);
  } catch (error) {
    console.error('Get series error:', error);
    const response = NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
    return handleCors(response);
  }
}

// PUT /api/articles/series/[slug] - Update series
export const PUT = withAuth(async (req, { params }: { params: { slug: string } }) => {
  try {
    await connectToDatabase();

    const body = await req.json();
    const { title, titleEn, description, coverImage } = body;

    const series = await ArticleSeries.findOne({ slug: params.slug });

    if (!series) {
      const response = NextResponse.json(
        { error: 'Series not found' },
        { status: 404 }
      );
      return handleCors(response);
    }

    // Check authorization
    if (series.author.toString() !== req.user!.userId) {
      const response = NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
      return handleCors(response);
    }

    // Update fields
    if (title) series.title = title;
    if (titleEn !== undefined) series.titleEn = titleEn;
    if (description) series.description = description;
    if (coverImage !== undefined) series.coverImage = coverImage;

    await series.save();
    await series.populate('author', 'name email avatar');

    const response = NextResponse.json({
      success: true,
      data: series,
    });
    return handleCors(response);
  } catch (error) {
    console.error('Update series error:', error);
    const response = NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
    return handleCors(response);
  }
});

// DELETE /api/articles/series/[slug] - Delete series
export const DELETE = withAuth(async (req, { params }: { params: { slug: string } }) => {
  try {
    await connectToDatabase();

    const series = await ArticleSeries.findOne({ slug: params.slug });

    if (!series) {
      const response = NextResponse.json(
        { error: 'Series not found' },
        { status: 404 }
      );
      return handleCors(response);
    }

    // Check authorization
    if (series.author.toString() !== req.user!.userId) {
      const response = NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
      return handleCors(response);
    }

    // Remove series reference from all articles
    await Article.updateMany(
      { series: series._id },
      { $unset: { series: 1, seriesOrder: 1 } }
    );

    await ArticleSeries.findByIdAndDelete(series._id);

    const response = NextResponse.json({
      success: true,
      message: 'Series deleted',
    });
    return handleCors(response);
  } catch (error) {
    console.error('Delete series error:', error);
    const response = NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
    return handleCors(response);
  }
});
