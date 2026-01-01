import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase, User } from '@codabiat/database';
import { hashPassword } from '@codabiat/auth';
import { handleCors, handleOptions } from '../../../../lib/cors';

export async function OPTIONS() {
  return handleOptions();
}

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();

    const body = await req.json();
    const { email, password, name, secretKey } = body;

    // Simple secret key check (در production باید پیچیده‌تر باشد)
    if (secretKey !== 'codabiat-admin-2025') {
      const response = NextResponse.json(
        { error: 'Invalid secret key' },
        { status: 403 }
      );
      return handleCors(response);
    }

    if (!email || !password || !name) {
      const response = NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
      return handleCors(response);
    }

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email });
    if (existingAdmin) {
      const response = NextResponse.json(
        {
          error: 'User already exists',
          admin: {
            email: existingAdmin.email,
            name: existingAdmin.name,
            role: existingAdmin.role,
          },
        },
        { status: 409 }
      );
      return handleCors(response);
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create admin user
    const admin = await User.create({
      email,
      password: hashedPassword,
      name,
      role: 'admin',
      xp: 0,
      level: 1,
      badges: [],
      artworksCount: 0,
      followersCount: 0,
      followingCount: 0,
      following: [],
      preferences: {
        language: 'fa',
        notifications: true,
        profilePublic: true,
      },
    });

    const response = NextResponse.json(
      {
        success: true,
        message: 'Admin user created successfully',
        admin: {
          id: admin._id,
          email: admin.email,
          name: admin.name,
          role: admin.role,
        },
      },
      { status: 201 }
    );
    return handleCors(response);
  } catch (error) {
    console.error('Create admin error:', error);
    const response = NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
    return handleCors(response);
  }
}
