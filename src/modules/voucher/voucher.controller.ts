import { Request, Response } from 'express';
import { Types } from 'mongoose';
import { VoucherService } from './voucher.service';
import { sendSuccess, sendError } from '../../interfaces/api-response';
import { DiscountType } from './voucher.model';

export class VoucherController {
  private voucherService: VoucherService;

  constructor() {
    this.voucherService = new VoucherService();
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const { code, discountType, discountValue, startDate, endDate, usageLimit, createdBy } =
        req.body;
      const voucher = await this.voucherService.create({
        code: code.toUpperCase(),
        discountType: discountType as DiscountType,
        discountValue,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        isActive: true,
        usageLimit,
        usageCount: 0,
        createdBy: new Types.ObjectId(createdBy),
      });
      sendSuccess(res, 'Voucher created successfully', voucher, 201);
    } catch (error: any) {
      sendError(res, error.message || 'Failed to create voucher', 400);
    }
  }

  async getAll(_req: Request, res: Response): Promise<void> {
    try {
      const vouchers = await this.voucherService.getAll();
      sendSuccess(res, 'Vouchers retrieved successfully', vouchers);
    } catch (error: any) {
      sendError(res, error.message || 'Failed to retrieve vouchers', 500);
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const voucher = await this.voucherService.getById(id);
      if (!voucher) {
        sendError(res, 'Voucher not found', 404);
        return;
      }
      sendSuccess(res, 'Voucher retrieved successfully', voucher);
    } catch (error: any) {
      sendError(res, error.message || 'Failed to retrieve voucher', 500);
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updateData: any = {};
      if (req.body.discountType) updateData.discountType = req.body.discountType;
      if (req.body.discountValue !== undefined) updateData.discountValue = req.body.discountValue;
      if (req.body.startDate) updateData.startDate = new Date(req.body.startDate);
      if (req.body.endDate) updateData.endDate = new Date(req.body.endDate);
      if (req.body.usageLimit !== undefined) updateData.usageLimit = req.body.usageLimit;

      const voucher = await this.voucherService.update(id, updateData);
      if (!voucher) {
        sendError(res, 'Voucher not found', 404);
        return;
      }
      sendSuccess(res, 'Voucher updated successfully', voucher);
    } catch (error: any) {
      sendError(res, error.message || 'Failed to update voucher', 400);
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const voucher = await this.voucherService.delete(id);
      if (!voucher) {
        sendError(res, 'Voucher not found', 404);
        return;
      }
      sendSuccess(res, 'Voucher deleted successfully', voucher);
    } catch (error: any) {
      sendError(res, error.message || 'Failed to delete voucher', 500);
    }
  }

  async activate(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const voucher = await this.voucherService.activate(id);
      if (!voucher) {
        sendError(res, 'Voucher not found', 404);
        return;
      }
      sendSuccess(res, 'Voucher activated successfully', voucher);
    } catch (error: any) {
      sendError(res, error.message || 'Failed to activate voucher', 400);
    }
  }

  async deactivate(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const voucher = await this.voucherService.deactivate(id);
      if (!voucher) {
        sendError(res, 'Voucher not found', 404);
        return;
      }
      sendSuccess(res, 'Voucher deactivated successfully', voucher);
    } catch (error: any) {
      sendError(res, error.message || 'Failed to deactivate voucher', 400);
    }
  }

  async getAvailable(_req: Request, res: Response): Promise<void> {
    try {
      const vouchers = await this.voucherService.getAvailableForUser();
      sendSuccess(res, 'Available vouchers retrieved successfully', vouchers);
    } catch (error: any) {
      sendError(res, error.message || 'Failed to retrieve available vouchers', 500);
    }
  }

  async validate(req: Request, res: Response): Promise<void> {
    try {
      const { code, orderAmount } = req.body;
      const result = await this.voucherService.validateVoucher(code, orderAmount);
      sendSuccess(res, result.message, {
        valid: result.valid,
        discount: result.discount,
      });
    } catch (error: any) {
      sendError(res, error.message || 'Failed to validate voucher', 400);
    }
  }
}
