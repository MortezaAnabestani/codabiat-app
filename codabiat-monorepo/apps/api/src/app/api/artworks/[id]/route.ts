import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase, Artwork, User } from '@codabiat/database';
import { withAuth } from '@codabiat/auth';
import { handleCors, handleOptions } from '../../../../lib/cors';

// OPTIONS /api/artworks/[id]
export async function OPTIONS() {
  return handleOptions();
}

// GET /api/artworks/[id] - Get single artwork
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();

    const artwork = await Artwork.findById(params.id)
      .populate('author', 'name email avatar level xp bio')
      .populate('comments.user', 'name avatar level')
      .lean();

    if (!artwork) {
      const response = NextResponse.json(
        { error: 'Artwork not found' },
        { status: 404 }
      );
      return handleCors(response);
    }

    // Increment view count
    await Artwork.findByIdAndUpdate(params.id, {
      $inc: { views: 1 },
    });

    const response = NextResponse.json({
      success: true,
      data: artwork,
    });
    return handleCors(response);
  } catch (error) {
    console.error('Get artwork error:', error);
    const response = NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
    return handleCors(response);
  }
}

// PUT /api/artworks/[id] - Update artwork (authenticated, owner only)
export const PUT = withAuth(async (req, { params }: { params: { id: string } }) => {
  try {
    await connectToDatabase();

    const artwork = await Artwork.findById(params.id);

    if (!artwork) {
      const response = NextResponse.json(
        { error: 'Artwork not found' },
        { status: 404 }
      );
      return handleCors(response);
    }

    // Check if user is the owner
    if (artwork.author.toString() !== req.user!.userId) {
      const response = NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
      return handleCors(response);
    }

    const body = await req.json();
    const {
      title,
      description,
      content,
      images,
      audio,
      video,
      tags,
      published,
    } = body;

    const updates: any = {};
    if (title) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (content) updates.content = content;
    if (images) updates.images = images;
    if (audio) updates.audio = audio;
    if (video !== undefined) updates.video = video;
    if (tags) updates.tags = tags;
    if (published !== undefined) updates.published = published;

    const updatedArtwork = await Artwork.findByIdAndUpdate(
      params.id,
      { $set: updates },
      { new: true }
    ).populate('author', 'name email avatar level xp');

    const response = NextResponse.json({
      success: true,
      data: updatedArtwork,
    });
    return handleCors(response);
  } catch (error) {
    console.error('Update artwork error:', error);
    const response = NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
    return handleCors(response);
  }
});

// DELETE /api/artworks/[id] - Delete artwork (authenticated, owner only)
export const DELETE = withAuth(async (req, { params }: { params: { id: string } }) => {
  try {
    await connectToDatabase();

    const artwork = await Artwork.findById(params.id);

    if (!artwork) {
      const response = NextResponse.json(
        { error: 'Artwork not found' },
        { status: 404 }
      );
      return handleCors(response);
    }

    // Check if user is the owner
    if (artwork.author.toString() !== req.user!.userId) {
      const response = NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
      return handleCors(response);
    }

    await Artwork.findByIdAndDelete(params.id);

    // Update user artwork count
    await User.findByIdAndUpdate(req.user!.userId, {
      $inc: { artworksCount: -1 },
    });

    const response = NextResponse.json({
      success: true,
      message: 'Artwork deleted successfully',
    });
    return handleCors(response);
  } catch (error) {
    console.error('Delete artwork error:', error);
    const response = NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
    return handleCors(response);
  }
});
