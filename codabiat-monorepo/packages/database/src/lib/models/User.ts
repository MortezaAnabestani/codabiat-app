import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  email: string;
  password: string;
  name: string;
  role: 'user' | 'admin';
  avatar?: string;
  bio?: string;

  // Gamification
  xp: number;
  level: number;
  badges: string[];

  // User stats
  artworksCount: number;
  followersCount: number;
  followingCount: number;

  // Social
  following: mongoose.Types.ObjectId[];

  // Settings
  preferences: {
    language: 'fa' | 'en';
    notifications: boolean;
    profilePublic: boolean;
  };

  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema<IUser> = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    avatar: {
      type: String,
    },
    bio: {
      type: String,
      maxlength: 500,
    },
    xp: {
      type: Number,
      default: 0,
      min: 0,
    },
    level: {
      type: Number,
      default: 1,
      min: 1,
    },
    badges: [{
      type: String,
    }],
    artworksCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    followersCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    followingCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    following: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
    }],
    preferences: {
      language: {
        type: String,
        enum: ['fa', 'en'],
        default: 'fa',
      },
      notifications: {
        type: Boolean,
        default: true,
      },
      profilePublic: {
        type: Boolean,
        default: true,
      },
    },
  },
  {
    timestamps: true,
  }
);

UserSchema.index({ email: 1 });
UserSchema.index({ name: 'text' });
UserSchema.index({ xp: -1 });
UserSchema.index({ level: -1 });

// Virtual to calculate level from XP
UserSchema.pre('save', function() {
  // Simple level calculation: level = floor(xp / 100) + 1
  this.level = Math.floor(this.xp / 100) + 1;
});

const User: Model<IUser> =
  (mongoose.models.User as Model<IUser>) ||
  mongoose.model<IUser>('User', UserSchema);

export default User;
