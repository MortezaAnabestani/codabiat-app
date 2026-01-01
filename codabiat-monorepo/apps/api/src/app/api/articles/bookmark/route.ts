import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase, Bookmark, Article } from '@codabiat/database';
import { withAuth } from '@codabiat/auth';
import { handleCors, handleOptions } from '../../../../lib/cors';

// OPTIONS /api/articles/bookmark
export async function OPTIONS() {
  return handleOptions();
}

// GET /api/articles/bookmark - Get user's bookmarks
export const GET = withAuth(async (req) => {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const [bookmarks, total] = await Promise.all([
      Bookmark.find({ user: req.user!.userId })
        .populate({
          path: 'article',
          populate: { path: 'author', select: 'name email avatar' }
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Bookmark.countDocuments({ user: req.user!.userId }),
    ]);

    const response = NextResponse.json({
      success: true,
      data: bookmarks,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
    return handleCors(response);
  } catch (error) {
    console.error('Get bookmarks error:', error);
    const response = NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
    return handleCors(response);
  }
});

// POST /api/articles/bookmark - Add bookmark
export const POST = withAuth(async (req) => {
  try {
    await connectToDatabase();

    const { articleId } = await req.json();

    if (!articleId) {
      const response = NextResponse.json(
        { error: 'Article ID is required' },
        { status: 400 }
      );
      return handleCors(response);
    }

    // Check if article exists
    const article = await Article.findById(articleId);
    if (!article) {
      const response = NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
      return handleCors(response);
    }

    // Check if already bookmarked
    const existing = await Bookmark.findOne({
      user: req.user!.userId,
      article: articleId,
    });

    if (existing) {
      const response = NextResponse.json(
        { error: 'Article already bookmarked' },
        { status: 400 }
      );
      return handleCors(response);
    }

    // Create bookmark
    const bookmark = await Bookmark.create({
      user: req.user!.userId,
      article: articleId,
    });

    // Increment bookmark count
    await Article.findByIdAndUpdate(articleId, {
      $inc: { bookmarkCount: 1 },
    });

    const response = NextResponse.json(
      {
        success: true,
        data: bookmark,
      },
      { status: 201 }
    );
    return handleCors(response);
  } catch (error) {
    console.error('Create bookmark error:', error);
    const response = NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
    return handleCors(response);
  }
});

// DELETE /api/articles/bookmark - Remove bookmark
export const DELETE = withAuth(async (req) => {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const articleId = searchParams.get('articleId');

    if (!articleId) {
      const response = NextResponse.json(
        { error: 'Article ID is required' },
        { status: 400 }
      );
      return handleCors(response);
    }

    const bookmark = await Bookmark.findOneAndDelete({
      user: req.user!.userId,
      article: articleId,
    });

    if (!bookmark) {
      const response = NextResponse.json(
        { error: 'Bookmark not found' },
        { status: 404 }
      );
      return handleCors(response);
    }

    // Decrement bookmark count
    await Article.findByIdAndUpdate(articleId, {
      $inc: { bookmarkCount: -1 },
    });

    const response = NextResponse.json({
      success: true,
      message: 'Bookmark removed',
    });
    return handleCors(response);
  } catch (error) {
    console.error('Delete bookmark error:', error);
    const response = NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
    return handleCors(response);
  }
});
