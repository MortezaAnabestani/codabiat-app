import { NextRequest, NextResponse } from 'next/server';
import {
  connectToDatabase,
  Article,
  Course,
  Artwork,
  UserPreferences,
  ContentMetadata,
  CourseProgress,
  Bookmark,
  ReadLater,
} from '@codabiat/database';
import { withAuth } from '@codabiat/auth';
import { handleCors, handleOptions } from '../../../lib/cors';

// OPTIONS /api/recommendations
export async function OPTIONS() {
  return handleOptions();
}

// GET /api/recommendations - Get personalized recommendations
export const GET = withAuth(async (req) => {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const contentType = searchParams.get('type') || 'all'; // article, course, artwork, all
    const limit = parseInt(searchParams.get('limit') || '10');

    const userId = req.user!.userId;

    // Get or create user preferences
    let userPrefs = await UserPreferences.findOne({ user: userId });
    if (!userPrefs) {
      userPrefs = await UserPreferences.create({
        user: userId,
        favoriteCategories: [],
        favoriteTechniques: [],
        preferredLanguage: 'fa',
        difficultyLevel: 'all',
      });
    }

    // Calculate recommendation scores for content
    const recommendations: any[] = [];

    // Get user's interaction history
    const [courseProgress, bookmarks, readLater] = await Promise.all([
      CourseProgress.find({ user: userId }).select('course').lean(),
      Bookmark.find({ user: userId }).select('article').lean(),
      ReadLater.find({ user: userId }).select('article').lean(),
    ]);

    const viewedCourseIds = courseProgress.map(cp => cp.course.toString());
    const bookmarkedArticleIds = bookmarks.map(b => b.article.toString());
    const readLaterArticleIds = readLater.map(rl => rl.article.toString());

    // Build recommendation query based on user preferences
    const metadataQuery: any = {};

    // Filter by content type
    if (contentType !== 'all') {
      metadataQuery.contentType = contentType;
    }

    // Filter by difficulty if user has preference
    if (userPrefs.difficultyLevel !== 'all') {
      metadataQuery.difficulty = userPrefs.difficultyLevel;
    }

    // Filter by language preference
    if (userPrefs.preferredLanguage !== 'both') {
      metadataQuery.$or = [
        { language: userPrefs.preferredLanguage },
        { language: 'both' },
      ];
    }

    // Get content metadata
    let contentMetadata = await ContentMetadata.find(metadataQuery)
      .sort({ popularityScore: -1, qualityScore: -1 })
      .limit(limit * 3) // Get more to filter and score
      .lean();

    // Score each content item based on user preferences
    contentMetadata = contentMetadata.map((meta: any) => {
      let score = 0;

      // Base score from quality and popularity
      score += meta.qualityScore * 0.3;
      score += meta.popularityScore * 0.2;

      // Boost score if matches favorite categories
      if (userPrefs!.favoriteCategories && userPrefs!.favoriteCategories.length > 0) {
        // This would need category info in metadata
        score += 10;
      }

      // Boost score if matches favorite techniques
      if (userPrefs!.favoriteTechniques && meta.techniques) {
        const matchingTechniques = meta.techniques.filter((t: string) =>
          userPrefs!.favoriteTechniques.includes(t)
        );
        score += matchingTechniques.length * 5;
      }

      // Boost newer content slightly
      const ageInDays = (Date.now() - new Date(meta.createdAt).getTime()) / (1000 * 60 * 60 * 24);
      if (ageInDays < 7) score += 15; // New content bonus
      else if (ageInDays < 30) score += 10;
      else if (ageInDays < 90) score += 5;

      // Penalize if user already interacted with this content
      const contentIdStr = meta.contentId.toString();
      if (meta.contentType === 'course' && viewedCourseIds.includes(contentIdStr)) {
        score -= 50;
      }
      if (meta.contentType === 'article') {
        if (bookmarkedArticleIds.includes(contentIdStr)) score -= 30;
        if (readLaterArticleIds.includes(contentIdStr)) score -= 20;
      }

      return { ...meta, _score: score };
    });

    // Sort by calculated score
    contentMetadata.sort((a: any, b: any) => b._score - a._score);

    // Take top items
    contentMetadata = contentMetadata.slice(0, limit);

    // Populate actual content
    const results = await Promise.all(
      contentMetadata.map(async (meta: any) => {
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

        if (!content) return null;

        return {
          ...content,
          _contentType: meta.contentType,
          _recommendationScore: meta._score,
          _metadata: {
            difficulty: meta.difficulty,
            language: meta.language,
            techniques: meta.techniques,
            estimatedTime: meta.estimatedTime,
          },
        };
      })
    );

    const validResults = results.filter(r => r !== null);

    const response = NextResponse.json({
      success: true,
      data: validResults,
      userPreferences: {
        favoriteCategories: userPrefs.favoriteCategories,
        favoriteTechniques: userPrefs.favoriteTechniques,
        preferredLanguage: userPrefs.preferredLanguage,
        difficultyLevel: userPrefs.difficultyLevel,
      },
    });
    return handleCors(response);
  } catch (error) {
    console.error('Recommendations error:', error);
    const response = NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
    return handleCors(response);
  }
});
