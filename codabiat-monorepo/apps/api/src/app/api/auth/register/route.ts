import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase, User } from '@codabiat/database';
import { hashPassword, generateToken } from '@codabiat/auth';
import { handleCors, handleOptions } from '../../../../lib/cors';

export async function OPTIONS() {
  return handleOptions();
}

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();

    const body = await req.json();
    const { email, password, name } = body;

    if (!email || !password || !name) {
      const response = NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
      return handleCors(response);
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      const response = NextResponse.json(
        { error: 'User already exists' },
        { status: 409 }
      );
      return handleCors(response);
    }

    const hashedPassword = await hashPassword(password);

    const user = await User.create({
      email,
      password: hashedPassword,
      name,
      role: 'user',
    });

    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    const response = NextResponse.json(
      {
        success: true,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
          xp: user.xp || 0,
          level: user.level || 1,
          badges: user.badges || [],
          artworksCount: 0,
          followersCount: 0,
          followingCount: 0,
        },
        token,
      },
      { status: 201 }
    );
    return handleCors(response);
  } catch (error) {
    console.error('Register error:', error);
    const response = NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
    return handleCors(response);
  }
}
