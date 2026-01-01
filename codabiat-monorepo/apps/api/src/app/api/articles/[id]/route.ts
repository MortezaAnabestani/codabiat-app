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
      .lean();

    if (!article) {
      const response = NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
      return handleCors(response);
    }

    await Article.findByIdAndUpdate(params.id, { $inc: { viewCount: 1 } });

    const response = NextResponse.json({
      success: true,
      data: article,
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
    const updatedArticle = await Article.findByIdAndUpdate(
      params.id,
      { $set: body },
      { new: true, runValidators: true }
    ).populate('author', 'name email avatar');

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
