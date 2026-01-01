import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase, Article } from '@codabiat/database';
import { withAuth } from '@codabiat/auth';
import { handleCors, handleOptions } from '../../../../lib/cors';

// OPTIONS /api/articles/[id]
export async function OPTIONS() {
  return handleOptions();
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();

    const article = await Article.findById(params.id)
      .populate('author', 'name email avatar')
      .populate('series', 'title slug description')
      .lean();

    if (!article) {
      const response = NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
      return handleCors(response);
    }

    // Increment view count
    await Article.findByIdAndUpdate(params.id, { $inc: { viewCount: 1 } });

    // Get related articles in the same series
    let relatedArticles = [];
    if (article.series) {
      relatedArticles = await Article.find({
        series: article.series,
        _id: { $ne: params.id },
        published: true,
      })
        .populate('author', 'name email avatar')
        .sort({ seriesOrder: 1, createdAt: 1 })
        .limit(5)
        .lean();
    }

    const response = NextResponse.json({
      success: true,
      data: {
        article,
        relatedArticles,
      },
    });
    return handleCors(response);
  } catch (error) {
    console.error('Get article error:', error);
    const response = NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
    return handleCors(response);
  }
}

export const PUT = withAuth(async (req, { params }: { params: { id: string } }) => {
  try {
    await connectToDatabase();

    const article = await Article.findById(params.id);

    if (!article) {
      const response = NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
      return handleCors(response);
    }

    if (article.author.toString() !== req.user!.userId && req.user!.role !== 'admin') {
      const response = NextResponse.json(
        { error: 'Forbidden - You can only edit your own articles' },
        { status: 403 }
      );
      return handleCors(response);
    }

    const body = await req.json();

    // If publishing for the first time, set publishedAt
    if (body.published && !article.published) {
      body.publishedAt = new Date();
    }

    const updatedArticle = await Article.findByIdAndUpdate(
      params.id,
      { $set: body },
      { new: true, runValidators: true }
    )
      .populate('author', 'name email avatar')
      .populate('series', 'title slug');

    const response = NextResponse.json({
      success: true,
      data: updatedArticle,
    });
    return handleCors(response);
  } catch (error) {
    console.error('Update article error:', error);
    const response = NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
    return handleCors(response);
  }
});

export const DELETE = withAuth(async (req, { params }: { params: { id: string } }) => {
  try {
    await connectToDatabase();

    const article = await Article.findById(params.id);

    if (!article) {
      const response = NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
      return handleCors(response);
    }

    if (article.author.toString() !== req.user!.userId && req.user!.role !== 'admin') {
      const response = NextResponse.json(
        { error: 'Forbidden - You can only delete your own articles' },
        { status: 403 }
      );
      return handleCors(response);
    }

    await Article.findByIdAndDelete(params.id);

    const response = NextResponse.json({
      success: true,
      message: 'Article deleted successfully',
    });
    return handleCors(response);
  } catch (error) {
    console.error('Delete article error:', error);
    const response = NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
    return handleCors(response);
  }
});
