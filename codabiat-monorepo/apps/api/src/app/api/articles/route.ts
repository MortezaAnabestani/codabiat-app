import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase, Article } from '@codabiat/database';
import { withAuth } from '@codabiat/auth';

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const published = searchParams.get('published');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const query: any = {};
    if (category) query.category = category;
    if (published) query.published = published === 'true';

    const skip = (page - 1) * limit;

    const [articles, total] = await Promise.all([
      Article.find(query)
        .populate('author', 'name email avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Article.countDocuments(query),
    ]);

    return NextResponse.json({
      success: true,
      data: articles,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get articles error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const POST = withAuth(async (req) => {
  try {
    await connectToDatabase();

    const body = await req.json();
    const { title, titleEn, content, contentEn, category, tags, coverImage } = body;

    if (!title || !content || !category) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const article = await Article.create({
      title,
      titleEn,
      content,
      contentEn,
      category,
      tags: tags || [],
      coverImage,
      author: req.user!.userId,
      published: false,
    });

    await article.populate('author', 'name email avatar');

    return NextResponse.json(
      {
        success: true,
        data: article,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create article error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});
