import { Types } from 'mongoose';
import { BaseService } from '../../core/services/base.service';
import { VoucherModel, IVoucher, DiscountType } from './voucher.model';

export class VoucherService extends BaseService<IVoucher> {
  constructor() {
    super(VoucherModel);
  }

  async getById(id: string | Types.ObjectId): Promise<IVoucher | null> {
    return await this.model.findById(id).populate('createdBy').exec();
  }

  async getAll(): Promise<IVoucher[]> {
    return await this.model.find().populate('createdBy').sort({ createdAt: -1 }).exec();
  }

  async activate(id: string | Types.ObjectId): Promise<IVoucher | null> {
    return await this.model
      .findByIdAndUpdate(id, { isActive: true }, { new: true })
      .exec();
  }

  async deactivate(id: string | Types.ObjectId): Promise<IVoucher | null> {
    return await this.model
      .findByIdAndUpdate(id, { isActive: false }, { new: true })
      .exec();
  }

  async getAvailableForUser(): Promise<IVoucher[]> {
    const now = new Date();
    return await this.model
      .find({
        isActive: true,
        startDate: { $lte: now },
        endDate: { $gte: now },
        $or: [{ usageLimit: { $exists: false } }, { $expr: { $lt: ['$usageCount', '$usageLimit'] } }],
      })
      .sort({ createdAt: -1 })
      .exec();
  }

  async validateVoucher(
    code: string,
    orderAmount: number
  ): Promise<{ valid: boolean; discount: number; message: string; voucher?: IVoucher }> {
    const voucher = await this.model.findOne({ code: code.toUpperCase() }).exec();

    if (!voucher) {
      return { valid: false, discount: 0, message: 'Voucher not found' };
    }

    if (!voucher.isActive) {
      return { valid: false, discount: 0, message: 'Voucher is not active' };
    }

    const now = new Date();
    if (now < voucher.startDate) {
      return { valid: false, discount: 0, message: 'Voucher has not started yet' };
    }

    if (now > voucher.endDate) {
      return { valid: false, discount: 0, message: 'Voucher has expired' };
    }

    if (voucher.usageLimit && voucher.usageCount >= voucher.usageLimit) {
      return { valid: false, discount: 0, message: 'Voucher usage limit exceeded' };
    }

    let discount = 0;
    if (voucher.discountType === DiscountType.PERCENTAGE) {
      discount = (orderAmount * voucher.discountValue) / 100;
    } else {
      discount = Math.min(voucher.discountValue, orderAmount);
    }

    if (discount > orderAmount) {
      discount = orderAmount;
    }

    return { valid: true, discount, message: 'Voucher is valid', voucher };
  }

  async validateAndApply(
    code: string,
    orderAmount: number
  ): Promise<{ valid: boolean; discount: number; voucherId?: Types.ObjectId; message: string }> {
    const validation = await this.validateVoucher(code, orderAmount);

    if (!validation.valid || !validation.voucher) {
      return {
        valid: false,
        discount: 0,
        message: validation.message,
      };
    }

    const voucher = validation.voucher;

    if (voucher.usageLimit && voucher.usageCount >= voucher.usageLimit) {
      return { valid: false, discount: 0, message: 'Voucher usage limit exceeded' };
    }

    return {
      valid: true,
      discount: validation.discount,
      voucherId: voucher._id,
      message: 'Voucher applied successfully',
    };
  }

  async incrementUsage(id: string | Types.ObjectId): Promise<void> {
    await this.model.findByIdAndUpdate(id, { $inc: { usageCount: 1 } }).exec();
  }
}
