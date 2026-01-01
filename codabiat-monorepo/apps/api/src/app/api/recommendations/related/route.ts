import { NextRequest, NextResponse } from 'next/server';
import {
  connectToDatabase,
  Article,
  Course,
  Artwork,
  ContentMetadata,
} from '@codabiat/database';
import { handleCors, handleOptions } from '../../../../lib/cors';

// OPTIONS /api/recommendations/related
export async function OPTIONS() {
  return handleOptions();
}

// GET /api/recommendations/related?contentId=xxx&contentType=article
// Get related content based on a specific content item
export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const contentId = searchParams.get('contentId');
    const contentType = searchParams.get('contentType');
    const limit = parseInt(searchParams.get('limit') || '5');

    if (!contentId || !contentType) {
      const response = NextResponse.json(
        { error: 'contentId and contentType are required' },
        { status: 400 }
      );
      return handleCors(response);
    }

    // Get metadata for the source content
    const sourceMetadata = await ContentMetadata.findOne({
      contentId,
      contentType,
    });

    if (!sourceMetadata) {
      // If no metadata exists, return empty results
      const response = NextResponse.json({
        success: true,
        data: [],
      });
      return handleCors(response);
    }

    // Find related content based on:
    // 1. Same category/techniques
    // 2. Similar difficulty
    // 3. Pre-calculated related content
    const relatedQuery: any = {
      _id: { $ne: sourceMetadata._id },
    };

    // Prioritize same content type but allow cross-type recommendations
    const sameTypeWeight = 0.7;
    const crossTypeWeight = 0.3;

    // Build query for similar content
    const orConditions: any[] = [];

    // Same techniques
    if (sourceMetadata.techniques && sourceMetadata.techniques.length > 0) {
      orConditions.push({
        techniques: { $in: sourceMetadata.techniques },
      });
    }

    // Same difficulty level
    orConditions.push({
      difficulty: sourceMetadata.difficulty,
    });

    // Same keywords
    if (sourceMetadata.keywords && sourceMetadata.keywords.length > 0) {
      orConditions.push({
        keywords: { $in: sourceMetadata.keywords },
      });
    }

    // Same tags
    if (sourceMetadata.tags && sourceMetadata.tags.length > 0) {
      orConditions.push({
        tags: { $in: sourceMetadata.tags },
      });
    }

    if (orConditions.length > 0) {
      relatedQuery.$or = orConditions;
    }

    // Get related content metadata
    let relatedMetadata = await ContentMetadata.find(relatedQuery)
      .limit(limit * 2)
      .lean();

    // Calculate similarity scores
    relatedMetadata = relatedMetadata.map((meta: any) => {
      let similarityScore = 0;

      // Technique overlap
      if (sourceMetadata.techniques && meta.techniques) {
        const commonTechniques = sourceMetadata.techniques.filter((t: string) =>
          meta.techniques.includes(t)
        );
        similarityScore += commonTechniques.length * 20;
      }

      // Keyword overlap
      if (sourceMetadata.keywords && meta.keywords) {
        const commonKeywords = sourceMetadata.keywords.filter((k: string) =>
          meta.keywords.includes(k)
        );
        similarityScore += commonKeywords.length * 15;
      }

      // Tag overlap
      if (sourceMetadata.tags && meta.tags) {
        const commonTags = sourceMetadata.tags.filter((t: string) =>
          meta.tags.includes(t)
        );
        similarityScore += commonTags.length * 10;
      }

      // Same difficulty bonus
      if (meta.difficulty === sourceMetadata.difficulty) {
        similarityScore += 10;
      }

      // Same content type bonus
      if (meta.contentType === sourceMetadata.contentType) {
        similarityScore *= (1 + sameTypeWeight);
      } else {
        similarityScore *= (1 + crossTypeWeight);
      }

      // Quality and popularity bonus
      similarityScore += meta.qualityScore * 0.2;
      similarityScore += meta.popularityScore * 0.1;

      return { ...meta, _similarityScore: similarityScore };
    });

    // Sort by similarity score
    relatedMetadata.sort((a: any, b: any) => b._similarityScore - a._similarityScore);

    // Take top items
    relatedMetadata = relatedMetadata.slice(0, limit);

    // Populate actual content
    const results = await Promise.all(
      relatedMetadata.map(async (meta: any) => {
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
          _similarityScore: meta._similarityScore,
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
    });
    return handleCors(response);
  } catch (error) {
    console.error('Related content error:', error);
    const response = NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
    return handleCors(response);
  }
}
