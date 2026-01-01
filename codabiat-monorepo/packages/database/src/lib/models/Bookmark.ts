import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IBookmark extends Document {
  _id: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  article: mongoose.Types.ObjectId;
  createdAt: Date;
}

const BookmarkSchema: Schema<IBookmark> = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    article: {
      type: Schema.Types.ObjectId,
      ref: 'Article',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

BookmarkSchema.index({ user: 1, article: 1 }, { unique: true });
BookmarkSchema.index({ user: 1, createdAt: -1 });

const Bookmark: Model<IBookmark> =
  (mongoose.models.Bookmark as Model<IBookmark>) ||
  mongoose.model<IBookmark>('Bookmark', BookmarkSchema);

export default Bookmark;
