import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase, User } from '@codabiat/database';
import { verifyToken } from '@codabiat/auth';
import { handleCors, handleOptions } from '../../../../lib/cors';

const getArtwork = async () => {
  const { default: Artwork } = await import('@codabiat/database/src/lib/models/Artwork');
  return Artwork;
};

const getArticle = async () => {
  const { default: Article } = await import('@codabiat/database/src/lib/models/Article');
  return Article;
};

const getComment = async () => {
  const { default: Comment } = await import('@codabiat/database/src/lib/models/Comment');
  return Comment;
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

    // Get stats
    const totalUsers = await User.countDocuments();
    const totalAdmins = await User.countDocuments({ role: 'admin' });

    // Users created in last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentUsers = await User.countDocuments({
      createdAt: { $gte: sevenDaysAgo },
    });

    // Get artwork stats
    const Artwork = await getArtwork();
    const totalArtworks = await Artwork.countDocuments();
    const recentArtworks = await Artwork.countDocuments({
      createdAt: { $gte: sevenDaysAgo },
    });

    // Aggregate artwork engagement stats
    const artworkStats = await Artwork.aggregate([
      {
        $group: {
          _id: null,
          totalViews: { $sum: '$views' },
          totalLikes: { $sum: '$likeCount' },
          totalComments: { $sum: '$commentCount' },
        },
      },
    ]);

    // Get article stats
    const Article = await getArticle();
    const totalArticles = await Article.countDocuments();
    const recentArticles = await Article.countDocuments({
      createdAt: { $gte: sevenDaysAgo },
    });

    // Aggregate article view stats
    const articleStats = await Article.aggregate([
      {
        $group: {
          _id: null,
          articleViews: { $sum: '$viewCount' },
        },
      },
    ]);

    // Get comment stats
    const Comment = await getComment();
    const totalComments = await Comment.countDocuments();
    const pendingComments = await Comment.countDocuments({ approved: false });
    const spamComments = await Comment.countDocuments({ spam: true });
    const recentComments = await Comment.countDocuments({
      createdAt: { $gte: sevenDaysAgo },
    });

    const stats = {
      totalUsers,
      totalAdmins,
      recentUsers,
      totalArtworks,
      totalArticles,
      totalViews: (artworkStats[0]?.totalViews || 0) + (articleStats[0]?.articleViews || 0),
      totalLikes: artworkStats[0]?.totalLikes || 0,
      totalComments,
      recentArtworks,
      recentArticles,
      recentComments,
      pendingComments,
      spamComments,
    };

    const response = NextResponse.json({ success: true, stats });
    return handleCors(response);
  } catch (error) {
    console.error('Admin stats error:', error);
    const response = NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
    return handleCors(response);
  }
}
