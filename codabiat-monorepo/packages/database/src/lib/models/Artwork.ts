import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IArtwork extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  author: mongoose.Types.ObjectId;

  // Lab module info
  labModule: string; // e.g., 'neural', 'cut-up', 'glitch', etc.
  labCategory: 'narrative' | 'text' | 'visual' | 'bio' | 'spatial' | 'other';

  // Content - different types based on module
  content: {
    text?: string;
    html?: string;
    data?: any; // For storing module-specific configuration
  };

  // Media files
  images?: string[]; // URLs to uploaded images
  audio?: string[]; // URLs to uploaded audio files
  video?: string; // URL to video if applicable

  // Metadata
  tags: string[];
  published: boolean;
  featured: boolean;

  // Social engagement
  likes: mongoose.Types.ObjectId[]; // User IDs who liked
  views: number;

  // Comments
  comments: {
    user: mongoose.Types.ObjectId;
    text: string;
    createdAt: Date;
  }[];

  createdAt: Date;
  updatedAt: Date;
}

const ArtworkSchema: Schema<IArtwork> = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    labModule: {
      type: String,
      required: true,
      enum: [
        'neural', 'cut-up', 'glitch', 'geometric', 'permutation', 'critical-code',
        'interactive-fiction', 'data-narrative', 'locative', 'hypertext',
        'bio-synthesis', 'text-orb', 'physics-text',
        'pixel-glitch', 'kinetic', 'cyber-islimi',
        'algorithmic-calligraphy', 'fractal-garden', 'semantic-cluster',
        'sonification', 'poetry-excavation', 'blind-owl', 'cyber-breach',
        'cyber-weaver', 'retro-console', 'other'
      ],
      index: true,
    },
    labCategory: {
      type: String,
      required: true,
      enum: ['narrative', 'text', 'visual', 'bio', 'spatial', 'other'],
      index: true,
    },
    content: {
      text: String,
      html: String,
      data: Schema.Types.Mixed,
    },
    images: [{
      type: String,
    }],
    audio: [{
      type: String,
    }],
    video: {
      type: String,
    },
    tags: [{
      type: String,
      trim: true,
      lowercase: true,
    }],
    published: {
      type: Boolean,
      default: false,
      index: true,
    },
    featured: {
      type: Boolean,
      default: false,
      index: true,
    },
    likes: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
    }],
    views: {
      type: Number,
      default: 0,
      index: true,
    },
    comments: [{
      user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      text: {
        type: String,
        required: true,
        maxlength: 500,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    }],
  },
  {
    timestamps: true,
  }
);

// Indexes
ArtworkSchema.index({ title: 'text', description: 'text', tags: 'text' });
ArtworkSchema.index({ labModule: 1, published: 1 });
ArtworkSchema.index({ labCategory: 1, published: 1 });
ArtworkSchema.index({ createdAt: -1 });
ArtworkSchema.index({ views: -1 });
ArtworkSchema.index({ featured: 1, published: 1, createdAt: -1 });

// Virtual for like count
ArtworkSchema.virtual('likeCount').get(function() {
  return this.likes?.length || 0;
});

// Virtual for comment count
ArtworkSchema.virtual('commentCount').get(function() {
  return this.comments?.length || 0;
});

// Ensure virtuals are included in JSON
ArtworkSchema.set('toJSON', { virtuals: true });
ArtworkSchema.set('toObject', { virtuals: true });

const Artwork: Model<IArtwork> =
  (mongoose.models.Artwork as Model<IArtwork>) ||
  mongoose.model<IArtwork>('Artwork', ArtworkSchema);

export default Artwork;
