import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase, Artwork, User } from '@codabiat/database';
import { withAuth } from '@codabiat/auth';
import { handleCors, handleOptions } from '../../../lib/cors';

// OPTIONS /api/artworks
export async function OPTIONS() {
  return handleOptions();
}

// GET /api/artworks - Get all artworks with filtering and pagination
export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const labModule = searchParams.get('labModule');
    const labCategory = searchParams.get('labCategory');
    const author = searchParams.get('author');
    const published = searchParams.get('published');
    const featured = searchParams.get('featured');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const sort = searchParams.get('sort') || '-createdAt'; // -createdAt, -views, -likes

    const query: any = {};

    if (labModule) query.labModule = labModule;
    if (labCategory) query.labCategory = labCategory;
    if (author) query.author = author;
    if (published) query.published = published === 'true';
    if (featured) query.featured = featured === 'true';
    if (search) {
      query.$text = { $search: search };
    }

    const skip = (page - 1) * limit;

    const [artworks, total] = await Promise.all([
      Artwork.find(query)
        .populate('author', 'name email avatar level xp')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Artwork.countDocuments(query),
    ]);

    const response = NextResponse.json({
      success: true,
      data: artworks,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
    return handleCors(response);
  } catch (error) {
    console.error('Get artworks error:', error);
    const response = NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
    return handleCors(response);
  }
}

// POST /api/artworks - Create new artwork (authenticated)
export const POST = withAuth(async (req) => {
  try {
    await connectToDatabase();

    const body = await req.json();
    const {
      title,
      description,
      labModule,
      labCategory,
      content,
      images,
      audio,
      video,
      tags,
      published,
    } = body;

    if (!title || !labModule || !labCategory) {
      const response = NextResponse.json(
        { error: 'Missing required fields: title, labModule, labCategory' },
        { status: 400 }
      );
      return handleCors(response);
    }

    const artwork = await Artwork.create({
      title,
      description,
      author: req.user!.userId,
      labModule,
      labCategory,
      content: content || {},
      images: images || [],
      audio: audio || [],
      video,
      tags: tags || [],
      published: published || false,
      featured: false,
      likes: [],
      views: 0,
      comments: [],
    });

    // Update user artwork count and give XP
    await User.findByIdAndUpdate(req.user!.userId, {
      $inc: { artworksCount: 1, xp: 10 }, // 10 XP for creating artwork
    });

    await artwork.populate('author', 'name email avatar level xp');

    const response = NextResponse.json(
      {
        success: true,
        data: artwork,
        message: 'Artwork created successfully! +10 XP',
      },
      { status: 201 }
    );
    return handleCors(response);
  } catch (error) {
    console.error('Create artwork error:', error);
    const response = NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
    return handleCors(response);
  }
});
