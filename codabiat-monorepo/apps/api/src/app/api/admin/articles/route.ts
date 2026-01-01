import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@codabiat/database';
import { verifyToken } from '@codabiat/auth';
import { handleCors, handleOptions } from '../../../../lib/cors';

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

// GET all articles with filters
export async function GET(req: NextRequest) {
  try {
    const admin = await verifyAdmin(req);
    if (!admin) {
      const response = NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      return handleCors(response);
    }

    await connectToDatabase();
    const Article = await getArticle();

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const published = searchParams.get('published') || '';
    const sort = searchParams.get('sort') || '-createdAt';

    // Build query
    const query: any = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { titleEn: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } },
      ];
    }

    if (category) {
      query.category = category;
    }

    if (published) {
      query.published = published === 'true';
    }

    // Count total
    const total = await Article.countDocuments(query);

    // Get articles
    const articles = await Article.find(query)
      .populate('author', 'name email avatar')
      .sort(sort)
      .limit(limit)
      .skip((page - 1) * limit)
      .lean();

    const response = NextResponse.json({
      success: true,
      articles,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
    return handleCors(response);
  } catch (error) {
    console.error('Admin get articles error:', error);
    const response = NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    return handleCors(response);
  }
}

// POST create new article
export async function POST(req: NextRequest) {
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

    // Validation
    if (!title || !content || !category) {
      const response = NextResponse.json(
        { error: 'Title, content, and category are required' },
        { status: 400 }
      );
      return handleCors(response);
    }

    const article = await Article.create({
      title,
      titleEn,
      content,
      contentEn,
      author: admin.userId,
      category,
      tags: tags || [],
      coverImage,
      published: published || false,
    });

    const populatedArticle = await Article.findById(article._id)
      .populate('author', 'name email avatar')
      .lean();

    const response = NextResponse.json({
      success: true,
      message: 'Article created',
      article: populatedArticle,
    });
    return handleCors(response);
  } catch (error) {
    console.error('Admin create article error:', error);
    const response = NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    return handleCors(response);
  }
}
