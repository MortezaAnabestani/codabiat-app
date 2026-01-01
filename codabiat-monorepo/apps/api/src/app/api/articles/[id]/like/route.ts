import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase, Article } from '@codabiat/database';
import { withAuth } from '@codabiat/auth';
import { handleCors, handleOptions } from '../../../../../lib/cors';

// OPTIONS /api/articles/[id]/like
export async function OPTIONS() {
  return handleOptions();
}

// POST /api/articles/[id]/like - Like an article
export const POST = withAuth(async (req, { params }: { params: { id: string } }) => {
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

    // Increment like count
    await Article.findByIdAndUpdate(params.id, {
      $inc: { likeCount: 1 },
    });

    const response = NextResponse.json({
      success: true,
      message: 'Article liked',
      likeCount: article.likeCount + 1,
    });
    return handleCors(response);
  } catch (error) {
    console.error('Like article error:', error);
    const response = NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
    return handleCors(response);
  }
});
