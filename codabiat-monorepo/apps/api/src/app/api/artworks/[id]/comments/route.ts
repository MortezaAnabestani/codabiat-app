import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase, Artwork, User } from '@codabiat/database';
import { withAuth } from '@codabiat/auth';
import { handleCors, handleOptions } from '../../../../../lib/cors';

// OPTIONS /api/artworks/[id]/comments
export async function OPTIONS() {
  return handleOptions();
}

// POST /api/artworks/[id]/comments - Add comment to artwork
export const POST = withAuth(async (req, { params }: { params: { id: string } }) => {
  try {
    await connectToDatabase();

    const body = await req.json();
    const { text } = body;

    if (!text || text.trim().length === 0) {
      const response = NextResponse.json(
        { error: 'Comment text is required' },
        { status: 400 }
      );
      return handleCors(response);
    }

    if (text.length > 500) {
      const response = NextResponse.json(
        { error: 'Comment is too long (max 500 characters)' },
        { status: 400 }
      );
      return handleCors(response);
    }

    const artwork = await Artwork.findById(params.id);

    if (!artwork) {
      const response = NextResponse.json(
        { error: 'Artwork not found' },
        { status: 404 }
      );
      return handleCors(response);
    }

    const comment = {
      user: req.user!.userId as any,
      text: text.trim(),
      createdAt: new Date(),
    };

    artwork.comments.push(comment);
    await artwork.save();

    // Give XP to artwork author
    if (artwork.author.toString() !== req.user!.userId) {
      await User.findByIdAndUpdate(artwork.author, {
        $inc: { xp: 3 }, // 3 XP for receiving a comment
      });
    }

    // Give XP to commenter
    await User.findByIdAndUpdate(req.user!.userId, {
      $inc: { xp: 1 }, // 1 XP for leaving a comment
    });

    const updatedArtwork = await Artwork.findById(params.id)
      .populate('comments.user', 'name avatar level')
      .lean();

    const response = NextResponse.json({
      success: true,
      data: updatedArtwork?.comments,
      message: 'Comment added! +1 XP for you, +3 XP for author',
    }, { status: 201 });
    return handleCors(response);
  } catch (error) {
    console.error('Add comment error:', error);
    const response = NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
    return handleCors(response);
  }
});
