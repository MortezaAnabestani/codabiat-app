import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase, Artwork, User } from '@codabiat/database';
import { withAuth } from '@codabiat/auth';
import { handleCors, handleOptions } from '../../../../../lib/cors';

// OPTIONS /api/artworks/[id]/like
export async function OPTIONS() {
  return handleOptions();
}

// POST /api/artworks/[id]/like - Toggle like on artwork
export const POST = withAuth(async (req, { params }: { params: { id: string } }) => {
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

    const userId = req.user!.userId;
    const hasLiked = artwork.likes.some((id) => id.toString() === userId);

    if (hasLiked) {
      // Unlike
      artwork.likes = artwork.likes.filter((id) => id.toString() !== userId);
      await artwork.save();

      const response = NextResponse.json({
        success: true,
        liked: false,
        likeCount: artwork.likes.length,
        message: 'Artwork unliked',
      });
      return handleCors(response);
    } else {
      // Like
      artwork.likes.push(userId as any);
      await artwork.save();

      // Give XP to artwork author
      if (artwork.author.toString() !== userId) {
        await User.findByIdAndUpdate(artwork.author, {
          $inc: { xp: 2 }, // 2 XP for receiving a like
        });
      }

      const response = NextResponse.json({
        success: true,
        liked: true,
        likeCount: artwork.likes.length,
        message: 'Artwork liked! Author received +2 XP',
      });
      return handleCors(response);
    }
  } catch (error) {
    console.error('Like artwork error:', error);
    const response = NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
    return handleCors(response);
  }
});
