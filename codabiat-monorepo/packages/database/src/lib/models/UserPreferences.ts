import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUserPreferences extends Document {
  _id: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;

  // Interest tracking
  favoriteCategories: string[];
  favoriteTechniques: string[];
  preferredLanguage: 'fa' | 'en' | 'both';
  difficultyLevel: 'beginner' | 'intermediate' | 'advanced' | 'all';

  // Interaction history for recommendations
  viewedArticles: mongoose.Types.ObjectId[];
  viewedCourses: mongoose.Types.ObjectId[];
  viewedArtworks: mongoose.Types.ObjectId[];
  completedCourses: mongoose.Types.ObjectId[];

  // Engagement metrics
  searchKeywords: string[]; // Most searched keywords
  interactionScore: {
    articles: number;
    courses: number;
    lab: number;
    artworks: number;
  };

  updatedAt: Date;
}

const UserPreferencesSchema: Schema<IUserPreferences> = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    favoriteCategories: [{
      type: String,
      enum: ['generative', 'interactive', 'hypertext', 'code-poetry', 'other'],
    }],
    favoriteTechniques: [String],
    preferredLanguage: {
      type: String,
      enum: ['fa', 'en', 'both'],
      default: 'fa',
    },
    difficultyLevel: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'all'],
      default: 'all',
    },
    viewedArticles: [{
      type: Schema.Types.ObjectId,
      ref: 'Article',
    }],
    viewedCourses: [{
      type: Schema.Types.ObjectId,
      ref: 'Course',
    }],
    viewedArtworks: [{
      type: Schema.Types.ObjectId,
      ref: 'Artwork',
    }],
    completedCourses: [{
      type: Schema.Types.ObjectId,
      ref: 'Course',
    }],
    searchKeywords: [String],
    interactionScore: {
      articles: { type: Number, default: 0 },
      courses: { type: Number, default: 0 },
      lab: { type: Number, default: 0 },
      artworks: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
  }
);

UserPreferencesSchema.index({ user: 1 });

const UserPreferences: Model<IUserPreferences> =
  (mongoose.models.UserPreferences as Model<IUserPreferences>) ||
  mongoose.model<IUserPreferences>('UserPreferences', UserPreferencesSchema);

export default UserPreferences;
