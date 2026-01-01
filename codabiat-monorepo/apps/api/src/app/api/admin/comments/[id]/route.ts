import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@codabiat/database';
import { verifyToken } from '@codabiat/auth';
import { handleCors, handleOptions } from '../../../../../lib/cors';

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

// GET single comment
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
    const Comment = await getComment();

    const comment = await Comment.findById(params.id)
      .populate('author', 'name email avatar')
      .populate('targetId', 'title')
      .lean();

    if (!comment) {
      const response = NextResponse.json({ error: 'Comment not found' }, { status: 404 });
      return handleCors(response);
    }

    const response = NextResponse.json({ success: true, comment });
    return handleCors(response);
  } catch (error) {
    console.error('Admin get comment error:', error);
    const response = NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    return handleCors(response);
  }
}

// PUT update comment (approve, mark as spam)
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
    const Comment = await getComment();

    const body = await req.json();
    const { approved, spam } = body;

    const updateData: any = {};
    if (approved !== undefined) updateData.approved = approved;
    if (spam !== undefined) updateData.spam = spam;

    const comment = await Comment.findByIdAndUpdate(
      params.id,
      updateData,
      { new: true }
    )
      .populate('author', 'name email avatar')
      .populate('targetId', 'title');

    if (!comment) {
      const response = NextResponse.json({ error: 'Comment not found' }, { status: 404 });
      return handleCors(response);
    }

    const response = NextResponse.json({
      success: true,
      message: 'Comment updated',
      comment,
    });
    return handleCors(response);
  } catch (error) {
    console.error('Admin update comment error:', error);
    const response = NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    return handleCors(response);
  }
}

// DELETE comment
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
    const Comment = await getComment();

    const comment = await Comment.findByIdAndDelete(params.id);

    if (!comment) {
      const response = NextResponse.json({ error: 'Comment not found' }, { status: 404 });
      return handleCors(response);
    }

    const response = NextResponse.json({
      success: true,
      message: 'Comment deleted',
    });
    return handleCors(response);
  } catch (error) {
    console.error('Admin delete comment error:', error);
    const response = NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    return handleCors(response);
  }
}
