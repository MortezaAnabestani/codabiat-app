import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase, Article } from '@codabiat/database';
import { withAuth } from '@codabiat/auth';

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
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }

    await Article.findByIdAndUpdate(params.id, { $inc: { viewCount: 1 } });

    return NextResponse.json({
      success: true,
      data: article,
    });
  } catch (error) {
    console.error('Get article error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const PUT = withAuth(async (req, { params }: { params: { id: string } }) => {
  try {
    await connectToDatabase();

    const article = await Article.findById(params.id);

    if (!article) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }

    if (article.author.toString() !== req.user!.userId && req.user!.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden - You can only edit your own articles' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const updatedArticle = await Article.findByIdAndUpdate(
      params.id,
      { $set: body },
      { new: true, runValidators: true }
    ).populate('author', 'name email avatar');

    return NextResponse.json({
      success: true,
      data: updatedArticle,
    });
  } catch (error) {
    console.error('Update article error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});

export const DELETE = withAuth(async (req, { params }: { params: { id: string } }) => {
  try {
    await connectToDatabase();

    const article = await Article.findById(params.id);

    if (!article) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }

    if (article.author.toString() !== req.user!.userId && req.user!.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden - You can only delete your own articles' },
        { status: 403 }
      );
    }

    await Article.findByIdAndDelete(params.id);

    return NextResponse.json({
      success: true,
      message: 'Article deleted successfully',
    });
  } catch (error) {
    console.error('Delete article error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});
