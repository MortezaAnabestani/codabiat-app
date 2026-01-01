import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISearchHistory extends Document {
  _id: mongoose.Types.ObjectId;
  user?: mongoose.Types.ObjectId;
  query: string;
  filters: {
    category?: string;
    difficulty?: string;
    language?: string;
    contentType?: string; // article, course, lab, artwork
  };
  resultsCount: number;
  clickedResults: mongoose.Types.ObjectId[]; // IDs of clicked items
  createdAt: Date;
}

const SearchHistorySchema: Schema<ISearchHistory> = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    query: {
      type: String,
      required: true,
      trim: true,
    },
    filters: {
      category: String,
      difficulty: String,
      language: String,
      contentType: String,
    },
    resultsCount: {
      type: Number,
      default: 0,
    },
    clickedResults: [{
      type: Schema.Types.ObjectId,
    }],
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
SearchHistorySchema.index({ user: 1, createdAt: -1 });
SearchHistorySchema.index({ query: 'text' });
SearchHistorySchema.index({ createdAt: -1 });

const SearchHistory: Model<ISearchHistory> =
  (mongoose.models.SearchHistory as Model<ISearchHistory>) ||
  mongoose.model<ISearchHistory>('SearchHistory', SearchHistorySchema);

export default SearchHistory;
