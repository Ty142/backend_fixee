import mongoose, { Schema, Document, Types } from 'mongoose';

export enum OrderStatus {
  CREATED = 'CREATED',
  CONFIRMED = 'CONFIRMED',
  MECHANIC_ASSIGNED = 'MECHANIC_ASSIGNED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export interface IOrder extends Document {
  customerId: Types.ObjectId;
  serviceId: Types.ObjectId;
  assignedMechanicId?: Types.ObjectId;
  assignedStaffId?: Types.ObjectId;
  status: OrderStatus;
  estimatedPrice: number;
  voucherId?: Types.ObjectId;
  voucherDiscount: number;
  finalPrice?: number;
  locationId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema<IOrder>(
  {
    customerId: {
      type: Schema.Types.ObjectId,
      ref: 'Actor',
      required: true,
    },
    serviceId: {
      type: Schema.Types.ObjectId,
      ref: 'Service',
      required: true,
    },
    assignedMechanicId: {
      type: Schema.Types.ObjectId,
      ref: 'Actor',
    },
    assignedStaffId: {
      type: Schema.Types.ObjectId,
      ref: 'Actor',
    },
    status: {
      type: String,
      enum: Object.values(OrderStatus),
      required: true,
      default: OrderStatus.CREATED,
    },
    estimatedPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    voucherId: {
      type: Schema.Types.ObjectId,
      ref: 'Voucher',
    },
    voucherDiscount: {
      type: Number,
      default: 0,
      min: 0,
    },
    finalPrice: {
      type: Number,
      min: 0,
    },
    locationId: {
      type: Schema.Types.ObjectId,
      ref: 'Location',
      required: true,
    },
  },
  {
    timestamps: true,
    collection: 'orders',
  }
);

export const OrderModel = mongoose.model<IOrder>('Order', OrderSchema);
