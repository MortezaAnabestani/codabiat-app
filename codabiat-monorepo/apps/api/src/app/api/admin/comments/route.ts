import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@codabiat/database';
import { verifyToken } from '@codabiat/auth';
import { handleCors, handleOptions } from '../../../../lib/cors';

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

// GET all comments with filters
export async function GET(req: NextRequest) {
  try {
    const admin = await verifyAdmin(req);
    if (!admin) {
      const response = NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      return handleCors(response);
    }

    await connectToDatabase();
    const Comment = await getComment();

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const targetType = searchParams.get('targetType') || '';
    const approved = searchParams.get('approved') || '';
    const spam = searchParams.get('spam') || '';
    const sort = searchParams.get('sort') || '-createdAt';

    // Build query
    const query: any = {};

    if (search) {
      query.content = { $regex: search, $options: 'i' };
    }

    if (targetType) {
      query.targetType = targetType;
    }

    if (approved) {
      query.approved = approved === 'true';
    }

    if (spam) {
      query.spam = spam === 'true';
    }

    // Count total
    const total = await Comment.countDocuments(query);

    // Get comments with populated fields
    const comments = await Comment.find(query)
      .populate('author', 'name email avatar')
      .populate('targetId', 'title')
      .sort(sort)
      .limit(limit)
      .skip((page - 1) * limit)
      .lean();

    const response = NextResponse.json({
      success: true,
      comments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
    return handleCors(response);
  } catch (error) {
    console.error('Admin get comments error:', error);
    const response = NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    return handleCors(response);
  }
}
