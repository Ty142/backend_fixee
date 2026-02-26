import { Request, Response } from 'express';
import { Types } from 'mongoose';
import { PaymentService } from './payment.service';
import { sendSuccess, sendError } from '../../interfaces/api-response';
import { PaymentMethod } from './payment.model';

export class PaymentController {
  private paymentService: PaymentService;

  constructor() {
    this.paymentService = new PaymentService();
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const { orderId, payerId, amount, method, transactionRef } = req.body;
      const payment = await this.paymentService.processPayment({
        orderId: new Types.ObjectId(orderId),
        payerId: new Types.ObjectId(payerId),
        amount,
        method: method as PaymentMethod,
        transactionRef,
      });
      sendSuccess(res, 'Payment processed successfully', payment, 201);
    } catch (error: any) {
      sendError(res, error.message || 'Failed to process payment', 400);
    }
  }

  async getAll(_req: Request, res: Response): Promise<void> {
    try {
      const payments = await this.paymentService.getAll();
      sendSuccess(res, 'Payments retrieved successfully', payments);
    } catch (error: any) {
      sendError(res, error.message || 'Failed to retrieve payments', 500);
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const payment = await this.paymentService.getById(id);
      if (!payment) {
        sendError(res, 'Payment not found', 404);
        return;
      }
      sendSuccess(res, 'Payment retrieved successfully', payment);
    } catch (error: any) {
      sendError(res, error.message || 'Failed to retrieve payment', 500);
    }
  }

  async getByActor(req: Request, res: Response): Promise<void> {
    try {
      const { actorId } = req.params;
      const payments = await this.paymentService.getByActorId(actorId);
      sendSuccess(res, 'Payment history retrieved successfully', payments);
    } catch (error: any) {
      sendError(res, error.message || 'Failed to retrieve payment history', 500);
    }
  }
}
