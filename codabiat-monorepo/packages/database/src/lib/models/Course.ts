import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ILesson {
  id: string;
  title: string;
  titleEn: string;
  content: string;
  contentEn: string;
  codeExample?: string;
  duration: number;
}

export interface IModule {
  id: string;
  title: string;
  titleEn: string;
  lessons: ILesson[];
}

export interface ICourse extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  instructor: mongoose.Types.ObjectId;
  level: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  techStack: string[];
  modules: IModule[];
  coverImage?: string;
  published: boolean;
  enrolledCount: number;
  rating: number;
  createdAt: Date;
  updatedAt: Date;
}

const LessonSchema = new Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  titleEn: { type: String },
  content: { type: String, required: true },
  contentEn: { type: String },
  codeExample: { type: String },
  duration: { type: Number, required: true },
});

const ModuleSchema = new Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  titleEn: { type: String },
  lessons: [LessonSchema],
});

const CourseSchema: Schema<ICourse> = new Schema(
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
    descriptionEn: {
      type: String,
    },
    instructor: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    techStack: [{
      type: String,
      trim: true,
    }],
    modules: [ModuleSchema],
    coverImage: {
      type: String,
    },
    published: {
      type: Boolean,
      default: false,
    },
    enrolledCount: {
      type: Number,
      default: 0,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
  },
  {
    timestamps: true,
  }
);

CourseSchema.index({ title: 'text', titleEn: 'text', description: 'text' });
CourseSchema.index({ category: 1, published: 1 });
CourseSchema.index({ level: 1 });

const Course: Model<ICourse> =
  (mongoose.models.Course as Model<ICourse>) ||
  mongoose.model<ICourse>('Course', CourseSchema);

export default Course;
