import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IArticle extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  titleEn: string;
  content: string;
  contentEn: string;
  author: mongoose.Types.ObjectId;
  category: string;
  tags: string[];
  coverImage?: string;
  published: boolean;
  viewCount: number;
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
    coverImage: {
      type: String,
    },
    published: {
      type: Boolean,
      default: false,
    },
    viewCount: {
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
