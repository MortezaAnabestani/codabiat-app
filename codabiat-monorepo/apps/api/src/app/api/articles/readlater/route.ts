import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase, ReadLater, Article } from '@codabiat/database';
import { withAuth } from '@codabiat/auth';
import { handleCors, handleOptions } from '../../../../lib/cors';

// OPTIONS /api/articles/readlater
export async function OPTIONS() {
  return handleOptions();
}

// GET /api/articles/readlater - Get user's read later list
export const GET = withAuth(async (req) => {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const completed = searchParams.get('completed');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const query: any = { user: req.user!.userId };
    if (completed !== null) {
      query.completed = completed === 'true';
    }

    const [items, total] = await Promise.all([
      ReadLater.find(query)
        .populate({
          path: 'article',
          populate: { path: 'author', select: 'name email avatar' }
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      ReadLater.countDocuments(query),
    ]);

    const response = NextResponse.json({
      success: true,
      data: items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
    return handleCors(response);
  } catch (error) {
    console.error('Get read later error:', error);
    const response = NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
    return handleCors(response);
  }
});

// POST /api/articles/readlater - Add to read later
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

    // Check if already in read later
    const existing = await ReadLater.findOne({
      user: req.user!.userId,
      article: articleId,
    });

    if (existing) {
      const response = NextResponse.json(
        { error: 'Article already in read later list' },
        { status: 400 }
      );
      return handleCors(response);
    }

    // Create read later entry
    const readLater = await ReadLater.create({
      user: req.user!.userId,
      article: articleId,
      completed: false,
    });

    const response = NextResponse.json(
      {
        success: true,
        data: readLater,
      },
      { status: 201 }
    );
    return handleCors(response);
  } catch (error) {
    console.error('Create read later error:', error);
    const response = NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
    return handleCors(response);
  }
});

// PUT /api/articles/readlater - Mark as completed
export const PUT = withAuth(async (req) => {
  try {
    await connectToDatabase();

    const { articleId, completed } = await req.json();

    if (!articleId || typeof completed !== 'boolean') {
      const response = NextResponse.json(
        { error: 'Article ID and completed status are required' },
        { status: 400 }
      );
      return handleCors(response);
    }

    const readLater = await ReadLater.findOneAndUpdate(
      {
        user: req.user!.userId,
        article: articleId,
      },
      { completed },
      { new: true }
    );

    if (!readLater) {
      const response = NextResponse.json(
        { error: 'Read later entry not found' },
        { status: 404 }
      );
      return handleCors(response);
    }

    const response = NextResponse.json({
      success: true,
      data: readLater,
    });
    return handleCors(response);
  } catch (error) {
    console.error('Update read later error:', error);
    const response = NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
    return handleCors(response);
  }
});

// DELETE /api/articles/readlater - Remove from read later
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

    const readLater = await ReadLater.findOneAndDelete({
      user: req.user!.userId,
      article: articleId,
    });

    if (!readLater) {
      const response = NextResponse.json(
        { error: 'Read later entry not found' },
        { status: 404 }
      );
      return handleCors(response);
    }

    const response = NextResponse.json({
      success: true,
      message: 'Removed from read later',
    });
    return handleCors(response);
  } catch (error) {
    console.error('Delete read later error:', error);
    const response = NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
    return handleCors(response);
  }
});
