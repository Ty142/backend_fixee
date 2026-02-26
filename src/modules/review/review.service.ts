import { Types } from 'mongoose';
import { BaseService } from '../../core/services/base.service';
import { ReviewModel, IReview, ReviewStatus } from './review.model';
import { OrderModel, OrderStatus } from '../order/order.model';

export class ReviewService extends BaseService<IReview> {
  constructor() {
    super(ReviewModel);
  }

  async create(data: {
    orderId: Types.ObjectId;
    reviewerId: Types.ObjectId;
    targetActorId: Types.ObjectId;
    rating: number;
    comment: string;
  }): Promise<IReview> {
    // Verify order exists and is completed
    const order = await OrderModel.findById(data.orderId).exec();
    if (!order) {
      throw new Error('Order not found');
    }

    if (order.status !== OrderStatus.COMPLETED) {
      throw new Error('Reviews can only be created for completed orders');
    }

    // Check if review already exists for this order
    const existingReview = await this.model.findOne({ orderId: data.orderId }).exec();
    if (existingReview) {
      throw new Error('Review already exists for this order');
    }

    // Validate rating
    if (data.rating < 1 || data.rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }

    const review = new this.model({
      ...data,
      status: ReviewStatus.PENDING,
    });
    return await review.save();
  }

  async moderate(
    id: string | Types.ObjectId,
    status: ReviewStatus
  ): Promise<IReview | null> {
    return await this.model.findByIdAndUpdate(id, { status }, { new: true }).exec();
  }

  async getById(id: string | Types.ObjectId): Promise<IReview | null> {
    return await this.model
      .findById(id)
      .populate('orderId')
      .populate('reviewerId')
      .populate('targetActorId')
      .exec();
  }

  async getByOrderId(orderId: string | Types.ObjectId): Promise<IReview | null> {
    return await this.model
      .findOne({ orderId })
      .populate('reviewerId')
      .populate('targetActorId')
      .exec();
  }

  async getByTargetActorId(targetActorId: string | Types.ObjectId): Promise<IReview[]> {
    return await this.model
      .find({ targetActorId })
      .populate('orderId')
      .populate('reviewerId')
      .sort({ createdAt: -1 })
      .exec();
  }

  async getByServiceId(serviceId: string | Types.ObjectId): Promise<IReview[]> {
    // Get all orders for this service
    const orders = await OrderModel.find({ serviceId }).select('_id').exec();
    const orderIds = orders.map((order) => order._id);

    // Get reviews for these orders
    return await this.model
      .find({ orderId: { $in: orderIds } })
      .populate('orderId')
      .populate('reviewerId')
      .populate('targetActorId')
      .sort({ createdAt: -1 })
      .exec();
  }

  async getAll(): Promise<IReview[]> {
    return await this.model
      .find()
      .populate('orderId')
      .populate('reviewerId')
      .populate('targetActorId')
      .sort({ createdAt: -1 })
      .exec();
  }
}
