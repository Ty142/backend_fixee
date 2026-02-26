import { Request, Response } from 'express';
import { Types } from 'mongoose';
import { OrderService } from './order.service';
import { sendSuccess, sendError } from '../../interfaces/api-response';
import { OrderStatus } from './order.model';

export class OrderController {
  private orderService: OrderService;

  constructor() {
    this.orderService = new OrderService();
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const { customerId, serviceId, estimatedPrice, locationId, voucherCode } = req.body;
      const order = await this.orderService.create({
        customerId: new Types.ObjectId(customerId),
        serviceId: new Types.ObjectId(serviceId),
        estimatedPrice,
        locationId: new Types.ObjectId(locationId),
        voucherCode,
      });
      sendSuccess(res, 'Order created successfully', order, 201);
    } catch (error: any) {
      sendError(res, error.message || 'Failed to create order', 400);
    }
  }

  async getAll(_req: Request, res: Response): Promise<void> {
    try {
      const orders = await this.orderService.getAll();
      sendSuccess(res, 'Orders retrieved successfully', orders);
    } catch (error: any) {
      sendError(res, error.message || 'Failed to retrieve orders', 500);
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const order = await this.orderService.getById(id);
      if (!order) {
        sendError(res, 'Order not found', 404);
        return;
      }
      sendSuccess(res, 'Order retrieved successfully', order);
    } catch (error: any) {
      sendError(res, error.message || 'Failed to retrieve order', 500);
    }
  }

  async getByActor(req: Request, res: Response): Promise<void> {
    try {
      const { actorId } = req.params;
      const orders = await this.orderService.getByActorId(actorId);
      sendSuccess(res, 'Orders retrieved successfully', orders);
    } catch (error: any) {
      sendError(res, error.message || 'Failed to retrieve orders', 500);
    }
  }

  async getByMechanic(req: Request, res: Response): Promise<void> {
    try {
      const { mechanicId } = req.params;
      const orders = await this.orderService.getByMechanicId(mechanicId);
      sendSuccess(res, 'Orders retrieved successfully', orders);
    } catch (error: any) {
      sendError(res, error.message || 'Failed to retrieve orders', 500);
    }
  }

  async getByStaff(req: Request, res: Response): Promise<void> {
    try {
      const { staffId } = req.params;
      const orders = await this.orderService.getByStaffId(staffId);
      sendSuccess(res, 'Orders retrieved successfully', orders);
    } catch (error: any) {
      sendError(res, error.message || 'Failed to retrieve orders', 500);
    }
  }

  async updateStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { status, assignedMechanicId } = req.body;
      const order = await this.orderService.updateStatus(
        id,
        status as OrderStatus,
        assignedMechanicId ? new Types.ObjectId(assignedMechanicId) : undefined
      );
      if (!order) {
        sendError(res, 'Order not found', 404);
        return;
      }
      sendSuccess(res, 'Order status updated successfully', order);
    } catch (error: any) {
      sendError(res, error.message || 'Failed to update order status', 400);
    }
  }
}
