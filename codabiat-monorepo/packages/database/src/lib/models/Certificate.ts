import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICertificate extends Document {
  _id: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  course: mongoose.Types.ObjectId;
  certificateId: string; // Unique ID for verification
  issuedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const CertificateSchema: Schema<ICertificate> = new Schema(
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
    certificateId: {
      type: String,
      required: true,
      unique: true,
    },
    issuedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

CertificateSchema.index({ user: 1, course: 1 }, { unique: true });
CertificateSchema.index({ certificateId: 1 });

const Certificate: Model<ICertificate> =
  (mongoose.models.Certificate as Model<ICertificate>) ||
  mongoose.model<ICertificate>('Certificate', CertificateSchema);

export default Certificate;
