import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ILocation extends Document {
  actorId: Types.ObjectId;
  addressText: string;
  latitude: number;
  longitude: number;
  isDefault: boolean;
  createdAt: Date;
}

const LocationSchema = new Schema<ILocation>(
  {
    actorId: {
      type: Schema.Types.ObjectId,
      ref: 'Actor',
      required: true,
    },
    addressText: {
      type: String,
      required: true,
      trim: true,
    },
    latitude: {
      type: Number,
      required: true,
    },
    longitude: {
      type: Number,
      required: true,
    },
    isDefault: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    collection: 'locations',
  }
);

export const LocationModel = mongoose.model<ILocation>('Location', LocationSchema);
