import mongoose, { Schema, Document, Model } from 'mongoose';

// Enhanced metadata for better search and recommendations
export interface IContentMetadata extends Document {
  _id: mongoose.Types.ObjectId;
  contentId: mongoose.Types.ObjectId;
  contentType: 'article' | 'course' | 'artwork' | 'lab';

  // Search optimization
  searchableText: string; // Combined searchable content
  keywords: string[];
  techniques: string[];

  // Classification
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  language: 'fa' | 'en' | 'both';
  estimatedTime: number; // minutes

  // Quality metrics
  qualityScore: number; // 0-100
  popularityScore: number; // 0-100
  relevanceScore: number; // 0-100 (calculated based on trends)

  // Related content (for recommendations)
  relatedContent: {
    contentId: mongoose.Types.ObjectId;
    contentType: string;
    relevanceScore: number;
  }[];

  // Tags for advanced filtering
  tags: string[];

  createdAt: Date;
  updatedAt: Date;
}

const ContentMetadataSchema: Schema<IContentMetadata> = new Schema(
  {
    contentId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    contentType: {
      type: String,
      required: true,
      enum: ['article', 'course', 'artwork', 'lab'],
    },
    searchableText: {
      type: String,
      required: true,
    },
    keywords: [String],
    techniques: [String],
    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner',
    },
    language: {
      type: String,
      enum: ['fa', 'en', 'both'],
      default: 'both',
    },
    estimatedTime: {
      type: Number,
      default: 10,
    },
    qualityScore: {
      type: Number,
      default: 50,
      min: 0,
      max: 100,
    },
    popularityScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    relevanceScore: {
      type: Number,
      default: 50,
      min: 0,
      max: 100,
    },
    relatedContent: [{
      contentId: Schema.Types.ObjectId,
      contentType: String,
      relevanceScore: Number,
    }],
    tags: [String],
  },
  {
    timestamps: true,
  }
);

// Text index for full-text search
ContentMetadataSchema.index({ searchableText: 'text', keywords: 'text', tags: 'text' });
ContentMetadataSchema.index({ contentId: 1, contentType: 1 }, { unique: true });
ContentMetadataSchema.index({ contentType: 1, difficulty: 1 });
ContentMetadataSchema.index({ contentType: 1, language: 1 });
ContentMetadataSchema.index({ popularityScore: -1 });
ContentMetadataSchema.index({ qualityScore: -1 });

const ContentMetadata: Model<IContentMetadata> =
  (mongoose.models.ContentMetadata as Model<IContentMetadata>) ||
  mongoose.model<IContentMetadata>('ContentMetadata', ContentMetadataSchema);

export default ContentMetadata;
