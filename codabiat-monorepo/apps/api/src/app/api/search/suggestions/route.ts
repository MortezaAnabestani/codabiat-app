import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase, SearchHistory, Article, Course } from '@codabiat/database';
import { handleCors, handleOptions } from '../../../../lib/cors';

// OPTIONS /api/search/suggestions
export async function OPTIONS() {
  return handleOptions();
}

// GET /api/search/suggestions - Get search suggestions based on partial query
export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q') || '';
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!query.trim() || query.length < 2) {
      const response = NextResponse.json({
        success: true,
        data: [],
      });
      return handleCors(response);
    }

    const suggestions = new Set<string>();

    // Get popular search queries
    const popularSearches = await SearchHistory.aggregate([
      {
        $match: {
          query: { $regex: query, $options: 'i' },
        },
      },
      {
        $group: {
          _id: '$query',
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
      {
        $limit: limit,
      },
    ]);

    popularSearches.forEach((item) => suggestions.add(item._id));

    // Get article titles
    const articles = await Article.find({
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { titleEn: { $regex: query, $options: 'i' } },
        { tags: { $regex: query, $options: 'i' } },
      ],
      published: true,
    })
      .select('title titleEn tags')
      .limit(5)
      .lean();

    articles.forEach((article) => {
      if (article.title) suggestions.add(article.title);
      if (article.titleEn) suggestions.add(article.titleEn);
      article.tags?.forEach((tag: string) => {
        if (tag.toLowerCase().includes(query.toLowerCase())) {
          suggestions.add(tag);
        }
      });
    });

    // Get course titles
    const courses = await Course.find({
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { titleEn: { $regex: query, $options: 'i' } },
      ],
    })
      .select('title titleEn')
      .limit(5)
      .lean();

    courses.forEach((course) => {
      if (course.title) suggestions.add(course.title);
      if (course.titleEn) suggestions.add(course.titleEn);
    });

    // Convert to array and limit
    const suggestionArray = Array.from(suggestions).slice(0, limit);

    const response = NextResponse.json({
      success: true,
      data: suggestionArray,
    });
    return handleCors(response);
  } catch (error) {
    console.error('Search suggestions error:', error);
    const response = NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
    return handleCors(response);
  }
}
