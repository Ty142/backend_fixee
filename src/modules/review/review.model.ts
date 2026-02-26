import mongoose, { Schema, Document, Types } from 'mongoose';

export enum ReviewStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export interface IReview extends Document {
  orderId: Types.ObjectId;
  reviewerId: Types.ObjectId;
  targetActorId: Types.ObjectId;
  rating: number; // 1-5
  comment: string;
  status: ReviewStatus;
  createdAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    orderId: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
    reviewerId: {
      type: Schema.Types.ObjectId,
      ref: 'Actor',
      required: true,
    },
    targetActorId: {
      type: Schema.Types.ObjectId,
      ref: 'Actor',
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: Object.values(ReviewStatus),
      required: true,
      default: ReviewStatus.PENDING,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    collection: 'reviews',
  }
);

export const ReviewModel = mongoose.model<IReview>('Review', ReviewSchema);
