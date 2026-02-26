import { Request, Response } from 'express';
import { ActorService } from './actor.service';
import { sendSuccess, sendError } from '../../interfaces/api-response';
import { ActorRole } from './actor.model';

export class ActorController {
  private actorService: ActorService;

  constructor() {
    this.actorService = new ActorService();
  }

  async getAll(_req: Request, res: Response): Promise<void> {
    try {
      const actors = await this.actorService.getAll();
      sendSuccess(res, 'Actors retrieved successfully', actors);
    } catch (error: any) {
      sendError(res, error.message || 'Failed to retrieve actors', 500);
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const actor = await this.actorService.getById(id);
      if (!actor) {
        sendError(res, 'Actor not found', 404);
        return;
      }
      sendSuccess(res, 'Actor retrieved successfully', actor);
    } catch (error: any) {
      sendError(res, error.message || 'Failed to retrieve actor', 500);
    }
  }

  async createAccount(req: Request, res: Response): Promise<void> {
    try {
      const { email, passwordHash, fullName, phoneNumber, role } = req.body;
      const actor = await this.actorService.createAccount({
        email,
        passwordHash,
        fullName,
        phoneNumber,
        role: role as ActorRole,
      });
      sendSuccess(res, 'Account created successfully', actor, 201);
    } catch (error: any) {
      sendError(res, error.message || 'Failed to create account', 400);
    }
  }

  async updateProfile(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { fullName, phoneNumber, avatarUrl } = req.body;
      const actor = await this.actorService.updateProfile(id, {
        fullName,
        phoneNumber,
        avatarUrl,
      });
      if (!actor) {
        sendError(res, 'Actor not found', 404);
        return;
      }
      sendSuccess(res, 'Profile updated successfully', actor);
    } catch (error: any) {
      sendError(res, error.message || 'Failed to update profile', 400);
    }
  }

  async lockAccount(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const actor = await this.actorService.lockAccount(id);
      if (!actor) {
        sendError(res, 'Actor not found', 404);
        return;
      }
      sendSuccess(res, 'Account locked successfully', actor);
    } catch (error: any) {
      sendError(res, error.message || 'Failed to lock account', 400);
    }
  }

  async unlockAccount(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const actor = await this.actorService.unlockAccount(id);
      if (!actor) {
        sendError(res, 'Actor not found', 404);
        return;
      }
      sendSuccess(res, 'Account unlocked successfully', actor);
    } catch (error: any) {
      sendError(res, error.message || 'Failed to unlock account', 400);
    }
  }

  async getStatistics(_req: Request, res: Response): Promise<void> {
    try {
      const statistics = await this.actorService.getStatistics();
      sendSuccess(res, 'Statistics retrieved successfully', statistics);
    } catch (error: any) {
      sendError(res, error.message || 'Failed to retrieve statistics', 500);
    }
  }
}
