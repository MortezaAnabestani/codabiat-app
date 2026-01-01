import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@codabiat/database';
import mongoose from 'mongoose';
import { handleCors, handleOptions } from '../../../../lib/cors';

// OPTIONS /api/files/[id]
export async function OPTIONS() {
  return handleOptions();
}

// GET /api/files/[id] - Get file from GridFS
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();

    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection not established');
    }

    const bucket = new mongoose.mongo.GridFSBucket(db, {
      bucketName: 'uploads',
    });

    // Convert string ID to ObjectId
    let fileId: mongoose.Types.ObjectId;
    try {
      fileId = new mongoose.Types.ObjectId(params.id);
    } catch (error) {
      const response = NextResponse.json(
        { error: 'Invalid file ID' },
        { status: 400 }
      );
      return handleCors(response);
    }

    // Get file info
    const files = await bucket.find({ _id: fileId }).toArray();

    if (!files || files.length === 0) {
      const response = NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
      return handleCors(response);
    }

    const file = files[0];

    // Stream file
    const downloadStream = bucket.openDownloadStream(fileId);

    // Convert stream to buffer
    const chunks: Buffer[] = [];
    for await (const chunk of downloadStream) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);

    // Return file with proper headers
    const response = new NextResponse(buffer, {
      headers: {
        'Content-Type': file.contentType || 'application/octet-stream',
        'Content-Length': file.length.toString(),
        'Cache-Control': 'public, max-age=31536000', // Cache for 1 year
      },
    });
    return handleCors(response);
  } catch (error) {
    console.error('Get file error:', error);
    const response = NextResponse.json(
      { error: 'Failed to retrieve file' },
      { status: 500 }
    );
    return handleCors(response);
  }
}

// DELETE /api/files/[id] - Delete file (owner only)
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();

    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection not established');
    }

    const bucket = new mongoose.mongo.GridFSBucket(db, {
      bucketName: 'uploads',
    });

    let fileId: mongoose.Types.ObjectId;
    try {
      fileId = new mongoose.Types.ObjectId(params.id);
    } catch (error) {
      const response = NextResponse.json(
        { error: 'Invalid file ID' },
        { status: 400 }
      );
      return handleCors(response);
    }

    // Check if file exists
    const files = await bucket.find({ _id: fileId }).toArray();

    if (!files || files.length === 0) {
      const response = NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
      return handleCors(response);
    }

    // Delete file
    await bucket.delete(fileId);

    const response = NextResponse.json({
      success: true,
      message: 'File deleted successfully',
    });
    return handleCors(response);
  } catch (error) {
    console.error('Delete file error:', error);
    const response = NextResponse.json(
      { error: 'Failed to delete file' },
      { status: 500 }
    );
    return handleCors(response);
  }
}
