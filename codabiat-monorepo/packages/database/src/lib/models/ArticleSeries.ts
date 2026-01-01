import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IArticleSeries extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  titleEn?: string;
  description: string;
  slug: string;
  coverImage?: string;
  author: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ArticleSeriesSchema: Schema<IArticleSeries> = new Schema(
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
    description: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    coverImage: {
      type: String,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

ArticleSeriesSchema.index({ slug: 1 });

const ArticleSeries: Model<IArticleSeries> =
  (mongoose.models.ArticleSeries as Model<IArticleSeries>) ||
  mongoose.model<IArticleSeries>('ArticleSeries', ArticleSeriesSchema);

export default ArticleSeries;
