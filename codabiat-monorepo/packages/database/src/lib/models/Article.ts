import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IArticle extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  titleEn: string;
  excerpt: string;
  content: string;
  contentEn: string;
  author: mongoose.Types.ObjectId;
  category: string;
  tags: string[];
  series?: mongoose.Types.ObjectId;
  seriesOrder?: number;
  coverImage?: string;
  published: boolean;
  publishedAt?: Date;
  featured: boolean;
  readTime: number; // minutes
  viewCount: number;
  likeCount: number;
  bookmarkCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const ArticleSchema: Schema<IArticle> = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    titleEn: {
      type: String,
      trim: true,
    },
    excerpt: {
      type: String,
      required: true,
      maxlength: 300,
    },
    content: {
      type: String,
      required: true,
    },
    contentEn: {
      type: String,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    category: {
      type: String,
      required: true,
      enum: ['generative', 'interactive', 'hypertext', 'code-poetry', 'other'],
    },
    tags: [{
      type: String,
      trim: true,
    }],
    series: {
      type: Schema.Types.ObjectId,
      ref: 'ArticleSeries',
    },
    seriesOrder: {
      type: Number,
    },
    coverImage: {
      type: String,
    },
    published: {
      type: Boolean,
      default: false,
    },
    publishedAt: {
      type: Date,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    readTime: {
      type: Number,
      default: 5,
    },
    viewCount: {
      type: Number,
      default: 0,
    },
    likeCount: {
      type: Number,
      default: 0,
    },
    bookmarkCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

ArticleSchema.index({ title: 'text', titleEn: 'text', content: 'text' });
ArticleSchema.index({ category: 1, published: 1 });
ArticleSchema.index({ createdAt: -1 });

const Article: Model<IArticle> =
  (mongoose.models.Article as Model<IArticle>) ||
  mongoose.model<IArticle>('Article', ArticleSchema);

export default Article;
