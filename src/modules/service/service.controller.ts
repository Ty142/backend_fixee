import { Request, Response } from 'express';
import { ServiceService } from './service.service';
import { sendSuccess, sendError } from '../../interfaces/api-response';

export class ServiceController {
  private serviceService: ServiceService;

  constructor() {
    this.serviceService = new ServiceService();
  }

  async getAll(_req: Request, res: Response): Promise<void> {
    try {
      const services = await this.serviceService.getActiveServices();
      sendSuccess(res, 'Services retrieved successfully', services);
    } catch (error: any) {
      sendError(res, error.message || 'Failed to retrieve services', 500);
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const service = await this.serviceService.getById(id);
      if (!service) {
        sendError(res, 'Service not found', 404);
        return;
      }
      sendSuccess(res, 'Service retrieved successfully', service);
    } catch (error: any) {
      sendError(res, error.message || 'Failed to retrieve service', 500);
    }
  }

  async approve(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const service = await this.serviceService.activate(id);
      if (!service) {
        sendError(res, 'Service not found', 404);
        return;
      }
      sendSuccess(res, 'Service approved successfully', service);
    } catch (error: any) {
      sendError(res, error.message || 'Failed to approve service', 400);
    }
  }

  async reject(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const service = await this.serviceService.deactivate(id);
      if (!service) {
        sendError(res, 'Service not found', 404);
        return;
      }
      sendSuccess(res, 'Service rejected successfully', service);
    } catch (error: any) {
      sendError(res, error.message || 'Failed to reject service', 400);
    }
  }
}
