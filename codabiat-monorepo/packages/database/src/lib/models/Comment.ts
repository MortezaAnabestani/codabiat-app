import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IComment extends Document {
  _id: mongoose.Types.ObjectId;
  content: string;
  author: mongoose.Types.ObjectId;
  targetType: 'artwork' | 'article';
  targetId: mongoose.Types.ObjectId;
  approved: boolean;
  spam: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CommentSchema: Schema<IComment> = new Schema(
  {
    content: {
      type: String,
      required: true,
      trim: true,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    targetType: {
      type: String,
      required: true,
      enum: ['artwork', 'article'],
    },
    targetId: {
      type: Schema.Types.ObjectId,
      required: true,
      refPath: 'targetType',
    },
    approved: {
      type: Boolean,
      default: true, // Auto-approve by default, admin can moderate later
    },
    spam: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

CommentSchema.index({ targetType: 1, targetId: 1, createdAt: -1 });
CommentSchema.index({ author: 1, createdAt: -1 });
CommentSchema.index({ approved: 1, spam: 1 });

const Comment: Model<IComment> =
  (mongoose.models.Comment as Model<IComment>) ||
  mongoose.model<IComment>('Comment', CommentSchema);

export default Comment;
