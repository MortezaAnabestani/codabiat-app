import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@codabiat/database';
import { verifyToken } from '@codabiat/auth';
import { handleCors, handleOptions } from '../../../../../lib/cors';

const getArticle = async () => {
  const { default: Article } = await import('@codabiat/database/src/lib/models/Article');
  return Article;
};

export async function OPTIONS() {
  return handleOptions();
}

async function verifyAdmin(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  try {
    const decoded = verifyToken(token);
    if (decoded.role !== 'admin') {
      return null;
    }
    return decoded;
  } catch (error) {
    return null;
  }
}

// GET single article
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await verifyAdmin(req);
    if (!admin) {
      const response = NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      return handleCors(response);
    }

    await connectToDatabase();
    const Article = await getArticle();

    const article = await Article.findById(params.id)
      .populate('author', 'name email avatar')
      .lean();

    if (!article) {
      const response = NextResponse.json({ error: 'Article not found' }, { status: 404 });
      return handleCors(response);
    }

    const response = NextResponse.json({ success: true, article });
    return handleCors(response);
  } catch (error) {
    console.error('Admin get article error:', error);
    const response = NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    return handleCors(response);
  }
}

// PUT update article
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await verifyAdmin(req);
    if (!admin) {
      const response = NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      return handleCors(response);
    }

    await connectToDatabase();
    const Article = await getArticle();

    const body = await req.json();
    const { title, titleEn, content, contentEn, category, tags, coverImage, published } = body;

    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (titleEn !== undefined) updateData.titleEn = titleEn;
    if (content !== undefined) updateData.content = content;
    if (contentEn !== undefined) updateData.contentEn = contentEn;
    if (category !== undefined) updateData.category = category;
    if (tags !== undefined) updateData.tags = tags;
    if (coverImage !== undefined) updateData.coverImage = coverImage;
    if (published !== undefined) updateData.published = published;

    const article = await Article.findByIdAndUpdate(
      params.id,
      updateData,
      { new: true }
    ).populate('author', 'name email avatar');

    if (!article) {
      const response = NextResponse.json({ error: 'Article not found' }, { status: 404 });
      return handleCors(response);
    }

    const response = NextResponse.json({
      success: true,
      message: 'Article updated',
      article,
    });
    return handleCors(response);
  } catch (error) {
    console.error('Admin update article error:', error);
    const response = NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    return handleCors(response);
  }
}

// DELETE article
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await verifyAdmin(req);
    if (!admin) {
      const response = NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      return handleCors(response);
    }

    await connectToDatabase();
    const Article = await getArticle();

    const article = await Article.findByIdAndDelete(params.id);

    if (!article) {
      const response = NextResponse.json({ error: 'Article not found' }, { status: 404 });
      return handleCors(response);
    }

    const response = NextResponse.json({
      success: true,
      message: 'Article deleted',
    });
    return handleCors(response);
  } catch (error) {
    console.error('Admin delete article error:', error);
    const response = NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    return handleCors(response);
  }
}
