import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase, User } from '@codabiat/database';
import { verifyToken } from '@codabiat/auth';
import { handleCors, handleOptions } from '../../../../lib/cors';

export async function OPTIONS() {
  return handleOptions();
}

// Middleware to verify admin
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
    // Verify admin
    const admin = await verifyAdmin(req);
    if (!admin) {
      const response = NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      );
      return handleCors(response);
    }

    await connectToDatabase();

    // Get query parameters
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const role = searchParams.get('role') || '';
    const sort = searchParams.get('sort') || '-createdAt';

    // Build query
    const query: any = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    if (role) {
      query.role = role;
    }

    // Count total
    const total = await User.countDocuments(query);

    // Get users
    const users = await User.find(query)
      .select('-password') // Exclude password
      .sort(sort)
      .limit(limit)
      .skip((page - 1) * limit)
      .lean();

    const response = NextResponse.json({
      success: true,
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
    return handleCors(response);
  } catch (error) {
    console.error('Admin get users error:', error);
    const response = NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
    return handleCors(response);
  }
}
