import mongoose, { Schema, Document } from 'mongoose';

export enum ActorRole {
  ADMIN = 'ADMIN',
  STAFF = 'STAFF',
  USER = 'USER',
  MECHANIC = 'MECHANIC',
}

export enum ActorStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
}

export interface IActor extends Document {
  email: string;
  passwordHash: string;
  fullName: string;
  phoneNumber: string;
  role: ActorRole;
  status: ActorStatus;
  avatarUrl?: string;
  otpCode?: string;
  otpExpiresAt?: Date;
  resetToken?: string;
  resetTokenExpiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ActorSchema = new Schema<IActor>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    phoneNumber: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      enum: Object.values(ActorRole),
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(ActorStatus),
      required: true,
      default: ActorStatus.ACTIVE,
    },
    avatarUrl: {
      type: String,
      trim: true,
    },
    otpCode: {
      type: String,
      trim: true,
    },
    otpExpiresAt: {
      type: Date,
    },
    resetToken: {
      type: String,
      trim: true,
    },
    resetTokenExpiresAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    collection: 'actors',
  }
);

export const ActorModel = mongoose.model<IActor>('Actor', ActorSchema);
