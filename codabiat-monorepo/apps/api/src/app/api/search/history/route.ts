import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase, SearchHistory } from '@codabiat/database';
import { withAuth } from '@codabiat/auth';
import { handleCors, handleOptions } from '../../../../lib/cors';

// OPTIONS /api/search/history
export async function OPTIONS() {
  return handleOptions();
}

// GET /api/search/history - Get user's search history
export const GET = withAuth(async (req) => {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '20');

    const history = await SearchHistory.find({ user: req.user!.userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    const response = NextResponse.json({
      success: true,
      data: history,
    });
    return handleCors(response);
  } catch (error) {
    console.error('Get search history error:', error);
    const response = NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
    return handleCors(response);
  }
});

// DELETE /api/search/history - Clear search history
export const DELETE = withAuth(async (req) => {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const historyId = searchParams.get('id');

    if (historyId) {
      // Delete specific history item
      await SearchHistory.findOneAndDelete({
        _id: historyId,
        user: req.user!.userId,
      });
    } else {
      // Clear all history
      await SearchHistory.deleteMany({ user: req.user!.userId });
    }

    const response = NextResponse.json({
      success: true,
      message: 'Search history cleared',
    });
    return handleCors(response);
  } catch (error) {
    console.error('Delete search history error:', error);
    const response = NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
    return handleCors(response);
  }
});
