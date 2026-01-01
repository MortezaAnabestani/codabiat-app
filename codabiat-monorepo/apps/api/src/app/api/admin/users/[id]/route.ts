import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase, User } from '@codabiat/database';
import { verifyToken } from '@codabiat/auth';
import { handleCors, handleOptions } from '../../../../../lib/cors';

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

// GET single user
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const user = await User.findById(params.id).select('-password').lean();

    if (!user) {
      const response = NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
      return handleCors(response);
    }

    const response = NextResponse.json({ success: true, user });
    return handleCors(response);
  } catch (error) {
    console.error('Admin get user error:', error);
    const response = NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
    return handleCors(response);
  }
}

// PUT update user
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const body = await req.json();
    const { role, xp, badges } = body;

    const updateData: any = {};
    if (role !== undefined) updateData.role = role;
    if (xp !== undefined) updateData.xp = xp;
    if (badges !== undefined) updateData.badges = badges;

    const user = await User.findByIdAndUpdate(
      params.id,
      updateData,
      { new: true }
    ).select('-password');

    if (!user) {
      const response = NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
      return handleCors(response);
    }

    const response = NextResponse.json({
      success: true,
      message: 'User updated',
      user,
    });
    return handleCors(response);
  } catch (error) {
    console.error('Admin update user error:', error);
    const response = NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
    return handleCors(response);
  }
}

// DELETE user
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const user = await User.findByIdAndDelete(params.id);

    if (!user) {
      const response = NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
      return handleCors(response);
    }

    const response = NextResponse.json({
      success: true,
      message: 'User deleted',
    });
    return handleCors(response);
  } catch (error) {
    console.error('Admin delete user error:', error);
    const response = NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
    return handleCors(response);
  }
}
