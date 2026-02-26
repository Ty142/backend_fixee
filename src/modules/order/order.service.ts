import { Types } from 'mongoose';
import { BaseService } from '../../core/services/base.service';
import { OrderModel, IOrder, OrderStatus } from './order.model';
import { VoucherService } from '../voucher/voucher.service';

export class OrderService extends BaseService<IOrder> {
  private voucherService: VoucherService;

  constructor() {
    super(OrderModel);
    this.voucherService = new VoucherService();
  }

  async create(data: {
    customerId: Types.ObjectId;
    serviceId: Types.ObjectId;
    estimatedPrice: number;
    locationId: Types.ObjectId;
    voucherCode?: string;
  }): Promise<IOrder> {
    let voucherId: Types.ObjectId | undefined;
    let voucherDiscount = 0;
    let finalPrice = data.estimatedPrice;

    if (data.voucherCode) {
      const validation = await this.voucherService.validateAndApply(
        data.voucherCode,
        data.estimatedPrice
      );

      if (!validation.valid) {
        throw new Error(validation.message);
      }

      voucherId = validation.voucherId;
      voucherDiscount = validation.discount;
      finalPrice = data.estimatedPrice - voucherDiscount;

      if (finalPrice < 0) {
        finalPrice = 0;
      }

      if (voucherId) {
        await this.voucherService.incrementUsage(voucherId);
      }
    }

    const order = new this.model({
      customerId: data.customerId,
      serviceId: data.serviceId,
      estimatedPrice: data.estimatedPrice,
      locationId: data.locationId,
      voucherId,
      voucherDiscount,
      finalPrice,
      status: OrderStatus.CREATED,
    });

    const savedOrder = await order.save();
    return savedOrder;
  }

  async getById(id: string | Types.ObjectId): Promise<IOrder | null> {
    return await this.model
      .findById(id)
      .populate('customerId')
      .populate('serviceId')
      .populate('assignedMechanicId')
      .populate('assignedStaffId')
      .populate('voucherId')
      .populate('locationId')
      .exec();
  }

  async getByActorId(actorId: string | Types.ObjectId): Promise<IOrder[]> {
    return await this.model
      .find({ customerId: actorId })
      .populate('serviceId')
      .populate('assignedMechanicId')
      .populate('locationId')
      .sort({ createdAt: -1 })
      .exec();
  }

  async getByMechanicId(mechanicId: string | Types.ObjectId): Promise<IOrder[]> {
    return await this.model
      .find({ assignedMechanicId: mechanicId })
      .populate('customerId')
      .populate('serviceId')
      .populate('locationId')
      .sort({ createdAt: -1 })
      .exec();
  }

  async getByStaffId(staffId: string | Types.ObjectId): Promise<IOrder[]> {
    return await this.model
      .find({ assignedStaffId: staffId })
      .populate('customerId')
      .populate('serviceId')
      .populate('locationId')
      .sort({ createdAt: -1 })
      .exec();
  }

  async getAll(): Promise<IOrder[]> {
    return await this.model
      .find()
      .populate('customerId')
      .populate('serviceId')
      .populate('assignedMechanicId')
      .populate('assignedStaffId')
      .populate('voucherId')
      .populate('locationId')
      .sort({ createdAt: -1 })
      .exec();
  }

  async updateStatus(
    id: string | Types.ObjectId,
    status: OrderStatus,
    assignedMechanicId?: Types.ObjectId
  ): Promise<IOrder | null> {
    const updateData: Partial<IOrder> = { status };
    if (assignedMechanicId) {
      updateData.assignedMechanicId = assignedMechanicId;
    }
    return await this.model.findByIdAndUpdate(id, updateData, { new: true }).exec();
  }

  async updateFinalPrice(
    id: string | Types.ObjectId,
    finalPrice: number
  ): Promise<IOrder | null> {
    return await this.model
      .findByIdAndUpdate(id, { finalPrice }, { new: true })
      .exec();
  }
}
