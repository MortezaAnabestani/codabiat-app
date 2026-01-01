import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@codabiat/database';
import { verifyToken } from '@codabiat/auth';
import { handleCors, handleOptions } from '../../../../lib/cors';
import mongoose from 'mongoose';

// Import Artwork model dynamically to avoid circular dependencies
const getArtwork = async () => {
  const { default: Artwork } = await import('@codabiat/database/src/lib/models/Artwork');
  return Artwork;
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

export async function GET(req: NextRequest) {
  try {
    const admin = await verifyAdmin(req);
    if (!admin) {
      const response = NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
      return handleCors(response);
    }

    await connectToDatabase();
    const Artwork = await getArtwork();

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const labCategory = searchParams.get('labCategory') || '';
    const published = searchParams.get('published') || '';
    const featured = searchParams.get('featured') || '';
    const sort = searchParams.get('sort') || '-createdAt';

    const query: any = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    if (labCategory) {
      query.labCategory = labCategory;
    }

    if (published === 'true') {
      query.published = true;
    } else if (published === 'false') {
      query.published = false;
    }

    if (featured === 'true') {
      query.featured = true;
    } else if (featured === 'false') {
      query.featured = false;
    }

    const total = await Artwork.countDocuments(query);

    const artworks = await Artwork.find(query)
      .populate('author', 'name email')
      .sort(sort)
      .limit(limit)
      .skip((page - 1) * limit)
      .lean();

    const response = NextResponse.json({
      success: true,
      artworks,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
    return handleCors(response);
  } catch (error) {
    console.error('Admin get artworks error:', error);
    const response = NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
    return handleCors(response);
  }
}
