import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase, Article } from '@codabiat/database';
import { withAuth } from '@codabiat/auth';
import { handleCors, handleOptions } from '../../../lib/cors';

// OPTIONS /api/articles
export async function OPTIONS() {
  return handleOptions();
}

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const published = searchParams.get('published');
    const featured = searchParams.get('featured');
    const seriesId = searchParams.get('series');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const query: any = {};
    if (category) query.category = category;
    if (published) query.published = published === 'true';
    if (featured) query.featured = featured === 'true';
    if (seriesId) query.series = seriesId;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { titleEn: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    const skip = (page - 1) * limit;

    const [articles, total] = await Promise.all([
      Article.find(query)
        .populate('author', 'name email avatar')
        .populate('series', 'title slug')
        .sort({ publishedAt: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Article.countDocuments(query),
    ]);

    const response = NextResponse.json({
      success: true,
      data: articles,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
    return handleCors(response);
  } catch (error) {
    console.error('Get articles error:', error);
    const response = NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
    return handleCors(response);
  }
}

export const POST = withAuth(async (req) => {
  try {
    await connectToDatabase();

    const body = await req.json();
    const {
      title,
      titleEn,
      excerpt,
      content,
      contentEn,
      category,
      tags,
      coverImage,
      series,
      seriesOrder,
      readTime
    } = body;

    if (!title || !excerpt || !content || !category) {
      const response = NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
      return handleCors(response);
    }

    const article = await Article.create({
      title,
      titleEn,
      excerpt,
      content,
      contentEn,
      category,
      tags: tags || [],
      coverImage,
      series: series || undefined,
      seriesOrder: seriesOrder || undefined,
      readTime: readTime || 5,
      author: req.user!.userId,
      published: false,
    });

    await article.populate('author', 'name email avatar');
    if (series) {
      await article.populate('series', 'title slug');
    }

    const response = NextResponse.json(
      {
        success: true,
        data: article,
      },
      { status: 201 }
    );
    return handleCors(response);
  } catch (error) {
    console.error('Create article error:', error);
    const response = NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
    return handleCors(response);
  }
});
