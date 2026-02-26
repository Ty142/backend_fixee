import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IService extends Document {
  name: string;
  description: string;
  basePrice: number;
  estimatedDuration: number; // minutes
  isActive: boolean;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ServiceSchema = new Schema<IService>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    basePrice: {
      type: Number,
      required: true,
      min: 0,
    },
    estimatedDuration: {
      type: Number,
      required: true,
      min: 0,
    },
    isActive: {
      type: Boolean,
      required: true,
      default: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'Actor',
      required: true,
    },
  },
  {
    timestamps: true,
    collection: 'services',
  }
);

export const ServiceModel = mongoose.model<IService>('Service', ServiceSchema);
