import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@codabiat/database';
import { verifyToken } from '@codabiat/auth';
import { handleCors, handleOptions } from '../../../../../lib/cors';

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

// GET single artwork
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
    const Artwork = await getArtwork();

    const artwork = await Artwork.findById(params.id)
      .populate('author', 'name email avatar')
      .lean();

    if (!artwork) {
      const response = NextResponse.json({ error: 'Artwork not found' }, { status: 404 });
      return handleCors(response);
    }

    const response = NextResponse.json({ success: true, artwork });
    return handleCors(response);
  } catch (error) {
    console.error('Admin get artwork error:', error);
    const response = NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    return handleCors(response);
  }
}

// PUT update artwork (approve, featured, etc.)
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
    const Artwork = await getArtwork();

    const body = await req.json();
    const { published, featured } = body;

    const updateData: any = {};
    if (published !== undefined) updateData.published = published;
    if (featured !== undefined) updateData.featured = featured;

    const artwork = await Artwork.findByIdAndUpdate(
      params.id,
      updateData,
      { new: true }
    ).populate('author', 'name email');

    if (!artwork) {
      const response = NextResponse.json({ error: 'Artwork not found' }, { status: 404 });
      return handleCors(response);
    }

    const response = NextResponse.json({
      success: true,
      message: 'Artwork updated',
      artwork,
    });
    return handleCors(response);
  } catch (error) {
    console.error('Admin update artwork error:', error);
    const response = NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    return handleCors(response);
  }
}

// DELETE artwork
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
    const Artwork = await getArtwork();

    const artwork = await Artwork.findByIdAndDelete(params.id);

    if (!artwork) {
      const response = NextResponse.json({ error: 'Artwork not found' }, { status: 404 });
      return handleCors(response);
    }

    const response = NextResponse.json({
      success: true,
      message: 'Artwork deleted',
    });
    return handleCors(response);
  } catch (error) {
    console.error('Admin delete artwork error:', error);
    const response = NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    return handleCors(response);
  }
}
