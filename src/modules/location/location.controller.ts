import { Request, Response } from 'express';
import { Types } from 'mongoose';
import { LocationService } from './location.service';
import { sendSuccess, sendError } from '../../interfaces/api-response';

export class LocationController {
  private locationService: LocationService;

  constructor() {
    this.locationService = new LocationService();
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const { actorId, addressText, latitude, longitude, isDefault } = req.body;
      const location = await this.locationService.create({
        actorId: new Types.ObjectId(actorId),
        addressText,
        latitude,
        longitude,
        isDefault: isDefault || false,
      });
      sendSuccess(res, 'Location created successfully', location, 201);
    } catch (error: any) {
      sendError(res, error.message || 'Failed to create location', 400);
    }
  }

  async getAll(_req: Request, res: Response): Promise<void> {
    try {
      const locations = await this.locationService.getAll();
      sendSuccess(res, 'Locations retrieved successfully', locations);
    } catch (error: any) {
      sendError(res, error.message || 'Failed to retrieve locations', 500);
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const location = await this.locationService.getById(id);
      if (!location) {
        sendError(res, 'Location not found', 404);
        return;
      }
      sendSuccess(res, 'Location retrieved successfully', location);
    } catch (error: any) {
      sendError(res, error.message || 'Failed to retrieve location', 500);
    }
  }

  async getByActorId(req: Request, res: Response): Promise<void> {
    try {
      const { actorId } = req.params;
      const locations = await this.locationService.getByActorId(actorId);
      sendSuccess(res, 'Locations retrieved successfully', locations);
    } catch (error: any) {
      sendError(res, error.message || 'Failed to retrieve locations', 500);
    }
  }
}
