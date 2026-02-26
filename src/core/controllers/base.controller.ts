import { Request, Response } from 'express';
import { BaseService } from '../services/base.service';
import { Document } from 'mongoose';
import { sendSuccess, sendError } from '../../interfaces/api-response';

export abstract class BaseController<T extends Document> {
  protected service: BaseService<T>;

  constructor(service: BaseService<T>) {
    this.service = service;
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const data = req.body;
      const result = await this.service.create(data);
      sendSuccess(res, 'Created successfully', result, 201);
    } catch (error: any) {
      sendError(res, error.message || 'Failed to create', 400);
    }
  }

  async getAll(_req: Request, res: Response): Promise<void> {
    try {
      const result = await this.service.getAll();
      sendSuccess(res, 'Retrieved successfully', result);
    } catch (error: any) {
      sendError(res, error.message || 'Failed to retrieve', 500);
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const result = await this.service.getById(id);
      if (!result) {
        sendError(res, 'Not found', 404);
        return;
      }
      sendSuccess(res, 'Retrieved successfully', result);
    } catch (error: any) {
      sendError(res, error.message || 'Failed to retrieve', 500);
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const data = req.body;
      const result = await this.service.update(id, data);
      if (!result) {
        sendError(res, 'Not found', 404);
        return;
      }
      sendSuccess(res, 'Updated successfully', result);
    } catch (error: any) {
      sendError(res, error.message || 'Failed to update', 400);
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const result = await this.service.delete(id);
      if (!result) {
        sendError(res, 'Not found', 404);
        return;
      }
      sendSuccess(res, 'Deleted successfully', result);
    } catch (error: any) {
      sendError(res, error.message || 'Failed to delete', 500);
    }
  }
}
