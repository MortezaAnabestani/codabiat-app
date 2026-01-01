import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@codabiat/database';
import { withAuth } from '@codabiat/auth';
import mongoose from 'mongoose';
import { handleCors, handleOptions } from '../../../lib/cors';

// OPTIONS /api/upload
export async function OPTIONS() {
  return handleOptions();
}

// POST /api/upload - Upload file (image, audio, or video)
export const POST = withAuth(async (req) => {
  try {
    await connectToDatabase();

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string; // 'image', 'audio', 'video'

    if (!file) {
      const response = NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
      return handleCors(response);
    }

    // Validate file type
    const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const validAudioTypes = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/webm'];
    const validVideoTypes = ['video/mp4', 'video/webm', 'video/ogg'];

    let isValid = false;
    if (type === 'image' && validImageTypes.includes(file.type)) {
      isValid = true;
    } else if (type === 'audio' && validAudioTypes.includes(file.type)) {
      isValid = true;
    } else if (type === 'video' && validVideoTypes.includes(file.type)) {
      isValid = true;
    }

    if (!isValid) {
      const response = NextResponse.json(
        { error: 'Invalid file type' },
        { status: 400 }
      );
      return handleCors(response);
    }

    // Size limits
    const maxSizes = {
      image: 5 * 1024 * 1024, // 5MB
      audio: 20 * 1024 * 1024, // 20MB
      video: 50 * 1024 * 1024, // 50MB
    };

    if (file.size > (maxSizes[type as keyof typeof maxSizes] || maxSizes.image)) {
      const response = NextResponse.json(
        { error: `File too large. Max size for ${type}: ${maxSizes[type as keyof typeof maxSizes] / 1024 / 1024}MB` },
        { status: 400 }
      );
      return handleCors(response);
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Use GridFS for storage
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection not established');
    }

    const bucket = new mongoose.mongo.GridFSBucket(db, {
      bucketName: 'uploads',
    });

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(7);
    const extension = file.name.split('.').pop();
    const filename = `${type}_${timestamp}_${randomString}.${extension}`;

    // Upload to GridFS
    const uploadStream = bucket.openUploadStream(filename, {
      contentType: file.type,
      metadata: {
        userId: req.user!.userId,
        originalName: file.name,
        fileType: type,
        uploadedAt: new Date(),
      },
    });

    await new Promise((resolve, reject) => {
      uploadStream.end(buffer, (error: any) => {
        if (error) reject(error);
        else resolve(uploadStream.id);
      });
    });

    const fileUrl = `/api/files/${uploadStream.id}`;

    const response = NextResponse.json({
      success: true,
      data: {
        fileId: uploadStream.id.toString(),
        filename,
        url: fileUrl,
        type,
        size: file.size,
        contentType: file.type,
      },
      message: 'File uploaded successfully',
    }, { status: 201 });
    return handleCors(response);
  } catch (error) {
    console.error('Upload error:', error);
    const response = NextResponse.json(
      { error: 'File upload failed' },
      { status: 500 }
    );
    return handleCors(response);
  }
});
