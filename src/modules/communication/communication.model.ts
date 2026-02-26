import mongoose, { Schema, Document, Types } from 'mongoose';

export enum MessageType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  SYSTEM = 'SYSTEM',
}

export interface ICommunication extends Document {
  orderId: Types.ObjectId;
  senderId: Types.ObjectId;
  receiverId: Types.ObjectId;
  content: string;
  type: MessageType;
  createdAt: Date;
  readAt?: Date;
}

const CommunicationSchema = new Schema<ICommunication>(
  {
    orderId: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
    senderId: {
      type: Schema.Types.ObjectId,
      ref: 'Actor',
      required: true,
    },
    receiverId: {
      type: Schema.Types.ObjectId,
      ref: 'Actor',
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: Object.values(MessageType),
      required: true,
      default: MessageType.TEXT,
    },
    readAt: {
      type: Date,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    collection: 'messages',
  }
);

export const CommunicationModel = mongoose.model<ICommunication>('Communication', CommunicationSchema);
