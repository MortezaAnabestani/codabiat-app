import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase, Article, Course, Artwork, ContentMetadata, SearchHistory, UserPreferences } from '@codabiat/database';
import { handleCors, handleOptions } from '../../../lib/cors';
import { verifyToken } from '@codabiat/auth';

// OPTIONS /api/search
export async function OPTIONS() {
  return handleOptions();
}

// GET /api/search - Advanced full-text search across all content
export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q') || '';
    const contentType = searchParams.get('type'); // article, course, artwork, all
    const category = searchParams.get('category');
    const difficulty = searchParams.get('difficulty');
    const language = searchParams.get('language');
    const technique = searchParams.get('technique');
    const sortBy = searchParams.get('sort') || 'relevance'; // relevance, popularity, recent, quality
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Get user preferences if authenticated
    let userId: string | null = null;
    const authHeader = req.headers.get('authorization');
    if (authHeader) {
      try {
        const token = authHeader.replace('Bearer ', '');
        const decoded = verifyToken(token);
        userId = decoded.userId;
      } catch (e) {
        // Continue as anonymous user
      }
    }

    let userPreferences = null;
    if (userId) {
      userPreferences = await UserPreferences.findOne({ user: userId });
    }

    // Build search query
    const searchQuery: any = {};

    if (query.trim()) {
      searchQuery.$text = { $search: query };
    }

    if (contentType && contentType !== 'all') {
      searchQuery.contentType = contentType;
    }

    if (difficulty) {
      searchQuery.difficulty = difficulty;
    }

    if (language && language !== 'both') {
      searchQuery.$or = [
        { language: language },
        { language: 'both' }
      ];
    }

    if (technique) {
      searchQuery.techniques = technique;
    }

    // Build sort criteria
    let sortCriteria: any = {};
    switch (sortBy) {
      case 'popularity':
        sortCriteria = { popularityScore: -1 };
        break;
      case 'recent':
        sortCriteria = { createdAt: -1 };
        break;
      case 'quality':
        sortCriteria = { qualityScore: -1 };
        break;
      case 'relevance':
      default:
        if (query.trim()) {
          sortCriteria = { score: { $meta: 'textScore' } };
        } else {
          sortCriteria = { relevanceScore: -1 };
        }
        break;
    }

    const skip = (page - 1) * limit;

    // Search in ContentMetadata first for unified search
    let metadataQuery = ContentMetadata.find(searchQuery);

    if (query.trim() && sortBy === 'relevance') {
      metadataQuery = metadataQuery.select({ score: { $meta: 'textScore' } });
    }

    const [metadata, total] = await Promise.all([
      metadataQuery
        .sort(sortCriteria)
        .skip(skip)
        .limit(limit)
        .lean(),
      ContentMetadata.countDocuments(searchQuery),
    ]);

    // Populate actual content based on metadata
    const results = await Promise.all(
      metadata.map(async (meta: any) => {
        let content = null;
        switch (meta.contentType) {
          case 'article':
            content = await Article.findById(meta.contentId)
              .populate('author', 'name email avatar')
              .populate('series', 'title slug')
              .lean();
            break;
          case 'course':
            content = await Course.findById(meta.contentId)
              .populate('instructor', 'name email avatar')
              .lean();
            break;
          case 'artwork':
            content = await Artwork.findById(meta.contentId)
              .populate('creator', 'name email avatar')
              .lean();
            break;
        }

        return {
          ...content,
          _contentType: meta.contentType,
          _metadata: {
            difficulty: meta.difficulty,
            language: meta.language,
            techniques: meta.techniques,
            estimatedTime: meta.estimatedTime,
            qualityScore: meta.qualityScore,
            popularityScore: meta.popularityScore,
          },
        };
      })
    );

    // Filter out null results
    const validResults = results.filter(r => r !== null);

    // Save search history if user is authenticated
    if (userId && query.trim()) {
      await SearchHistory.create({
        user: userId,
        query,
        filters: {
          category,
          difficulty,
          language,
          contentType,
        },
        resultsCount: total,
      });

      // Update user preferences with search keyword
      if (userPreferences) {
        const keywords = userPreferences.searchKeywords || [];
        if (!keywords.includes(query.toLowerCase())) {
          keywords.push(query.toLowerCase());
          if (keywords.length > 50) keywords.shift(); // Keep last 50
          userPreferences.searchKeywords = keywords;
          await userPreferences.save();
        }
      }
    }

    const response = NextResponse.json({
      success: true,
      data: validResults,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      query,
      filters: {
        contentType,
        category,
        difficulty,
        language,
        technique,
        sortBy,
      },
    });
    return handleCors(response);
  } catch (error) {
    console.error('Search error:', error);
    const response = NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
    return handleCors(response);
  }
}
