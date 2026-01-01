import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase, UserPreferences } from '@codabiat/database';
import { withAuth } from '@codabiat/auth';
import { handleCors, handleOptions } from '../../../lib/cors';

// OPTIONS /api/preferences
export async function OPTIONS() {
  return handleOptions();
}

// GET /api/preferences - Get user preferences
export const GET = withAuth(async (req) => {
  try {
    await connectToDatabase();

    let preferences = await UserPreferences.findOne({ user: req.user!.userId });

    if (!preferences) {
      // Create default preferences
      preferences = await UserPreferences.create({
        user: req.user!.userId,
        favoriteCategories: [],
        favoriteTechniques: [],
        preferredLanguage: 'fa',
        difficultyLevel: 'all',
      });
    }

    const response = NextResponse.json({
      success: true,
      data: preferences,
    });
    return handleCors(response);
  } catch (error) {
    console.error('Get preferences error:', error);
    const response = NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
    return handleCors(response);
  }
});

// PUT /api/preferences - Update user preferences
export const PUT = withAuth(async (req) => {
  try {
    await connectToDatabase();

    const body = await req.json();
    const {
      favoriteCategories,
      favoriteTechniques,
      preferredLanguage,
      difficultyLevel,
    } = body;

    let preferences = await UserPreferences.findOne({ user: req.user!.userId });

    if (!preferences) {
      preferences = await UserPreferences.create({
        user: req.user!.userId,
        favoriteCategories: favoriteCategories || [],
        favoriteTechniques: favoriteTechniques || [],
        preferredLanguage: preferredLanguage || 'fa',
        difficultyLevel: difficultyLevel || 'all',
      });
    } else {
      if (favoriteCategories !== undefined) {
        preferences.favoriteCategories = favoriteCategories;
      }
      if (favoriteTechniques !== undefined) {
        preferences.favoriteTechniques = favoriteTechniques;
      }
      if (preferredLanguage !== undefined) {
        preferences.preferredLanguage = preferredLanguage;
      }
      if (difficultyLevel !== undefined) {
        preferences.difficultyLevel = difficultyLevel;
      }

      await preferences.save();
    }

    const response = NextResponse.json({
      success: true,
      data: preferences,
    });
    return handleCors(response);
  } catch (error) {
    console.error('Update preferences error:', error);
    const response = NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
    return handleCors(response);
  }
});
