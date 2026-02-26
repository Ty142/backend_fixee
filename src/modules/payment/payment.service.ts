import { Types } from 'mongoose';
import { BaseService } from '../../core/services/base.service';
import { PaymentModel, IPayment, PaymentStatus, PaymentMethod } from './payment.model';
import { OrderModel, OrderStatus } from '../order/order.model';

export class PaymentService extends BaseService<IPayment> {
  constructor() {
    super(PaymentModel);
  }

  async getById(id: string | Types.ObjectId): Promise<IPayment | null> {
    return await this.model
      .findById(id)
      .populate('orderId')
      .populate('payerId')
      .exec();
  }

  async getAll(): Promise<IPayment[]> {
    return await this.model
      .find()
      .populate('orderId')
      .populate('payerId')
      .sort({ createdAt: -1 })
      .exec();
  }

  async getByActorId(actorId: string | Types.ObjectId): Promise<IPayment[]> {
    return await this.model
      .find({ payerId: actorId })
      .populate('orderId')
      .sort({ createdAt: -1 })
      .exec();
  }

  async processPayment(data: {
    orderId: Types.ObjectId;
    payerId: Types.ObjectId;
    amount: number;
    method: PaymentMethod;
    transactionRef: string;
  }): Promise<IPayment> {
    // Verify order exists and is in valid state
    const order = await OrderModel.findById(data.orderId).exec();
    if (!order) {
      throw new Error('Order not found');
    }

    if (order.status === OrderStatus.CANCELLED) {
      throw new Error('Cannot process payment for cancelled order');
    }

    // Check if payment already exists for this order
    const existingPayment = await this.model
      .findOne({ orderId: data.orderId, status: PaymentStatus.SUCCESS })
      .exec();

    if (existingPayment) {
      throw new Error('Payment already processed for this order');
    }

    // Create payment
    const payment = new this.model({
      ...data,
      status: PaymentStatus.PENDING,
    });

    const savedPayment = await payment.save();

    // Update payment status to SUCCESS (in real scenario, this would be done after payment gateway confirmation)
    savedPayment.status = PaymentStatus.SUCCESS;
    await savedPayment.save();

    return savedPayment;
  }
}
