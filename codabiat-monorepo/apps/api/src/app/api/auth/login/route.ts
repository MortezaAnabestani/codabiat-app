import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase, User } from '@codabiat/database';
import { verifyPassword, generateToken } from '@codabiat/auth';
import { handleCors, handleOptions } from '../../../../lib/cors';

export async function OPTIONS() {
  return handleOptions();
}

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();

    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      const response = NextResponse.json(
        { error: 'Missing email or password' },
        { status: 400 }
      );
      return handleCors(response);
    }

    const user = await User.findOne({ email });
    if (!user) {
      const response = NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
      return handleCors(response);
    }

    const isValidPassword = await verifyPassword(password, user.password);
    if (!isValidPassword) {
      const response = NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
      return handleCors(response);
    }

    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar,
        bio: user.bio,
        xp: user.xp || 0,
        level: user.level || 1,
        badges: user.badges || [],
        artworksCount: 0,
        followersCount: 0,
        followingCount: 0,
      },
      token,
    });
    return handleCors(response);
  } catch (error) {
    console.error('Login error:', error);
    const response = NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
    return handleCors(response);
  }
}
