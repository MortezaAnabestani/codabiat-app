import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ILessonProgress {
  lessonId: string;
  completed: boolean;
  completedAt?: Date;
  timeSpent: number; // in seconds
}

export interface IModuleProgress {
  moduleId: string;
  lessons: ILessonProgress[];
  completed: boolean;
}

export interface ICourseProgress extends Document {
  _id: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  course: mongoose.Types.ObjectId;
  modules: IModuleProgress[];
  overallProgress: number; // 0-100
  startedAt: Date;
  completedAt?: Date;
  lastAccessedAt: Date;
  certificateIssued: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const LessonProgressSchema = new Schema({
  lessonId: { type: String, required: true },
  completed: { type: Boolean, default: false },
  completedAt: { type: Date },
  timeSpent: { type: Number, default: 0 },
});

const ModuleProgressSchema = new Schema({
  moduleId: { type: String, required: true },
  lessons: [LessonProgressSchema],
  completed: { type: Boolean, default: false },
});

const CourseProgressSchema: Schema<ICourseProgress> = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    course: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    modules: [ModuleProgressSchema],
    overallProgress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: {
      type: Date,
    },
    lastAccessedAt: {
      type: Date,
      default: Date.now,
    },
    certificateIssued: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

CourseProgressSchema.index({ user: 1, course: 1 }, { unique: true });
CourseProgressSchema.index({ user: 1, completedAt: -1 });

const CourseProgress: Model<ICourseProgress> =
  (mongoose.models.CourseProgress as Model<ICourseProgress>) ||
  mongoose.model<ICourseProgress>('CourseProgress', CourseProgressSchema);

export default CourseProgress;
