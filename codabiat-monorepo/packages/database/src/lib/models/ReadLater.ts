import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IReadLater extends Document {
  _id: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  article: mongoose.Types.ObjectId;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ReadLaterSchema: Schema<IReadLater> = new Schema(
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
    completed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

ReadLaterSchema.index({ user: 1, article: 1 }, { unique: true });
ReadLaterSchema.index({ user: 1, completed: 1, createdAt: -1 });

const ReadLater: Model<IReadLater> =
  (mongoose.models.ReadLater as Model<IReadLater>) ||
  mongoose.model<IReadLater>('ReadLater', ReadLaterSchema);

export default ReadLater;
