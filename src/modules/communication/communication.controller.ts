import { Request, Response } from 'express';
import { Types } from 'mongoose';
import { CommunicationService } from './communication.service';
import { sendSuccess, sendError } from '../../interfaces/api-response';
import { MessageType } from './communication.model';

export class CommunicationController {
  private communicationService: CommunicationService;

  constructor() {
    this.communicationService = new CommunicationService();
  }

  async sendMessage(req: Request, res: Response): Promise<void> {
    try {
      const { orderId, senderId, receiverId, content, type } = req.body;
      const message = await this.communicationService.createMessage({
        orderId: new Types.ObjectId(orderId),
        senderId: new Types.ObjectId(senderId),
        receiverId: new Types.ObjectId(receiverId),
        content,
        type: type || MessageType.TEXT,
      });
      sendSuccess(res, 'Message sent successfully', message, 201);
    } catch (error: any) {
      sendError(res, error.message || 'Failed to send message', 400);
    }
  }

  async createMessage(req: Request, res: Response): Promise<void> {
    try {
      const { orderId, senderId, receiverId, content, type } = req.body;
      const message = await this.communicationService.createMessage({
        orderId: new Types.ObjectId(orderId),
        senderId: new Types.ObjectId(senderId),
        receiverId: new Types.ObjectId(receiverId),
        content,
        type: type || MessageType.TEXT,
      });
      sendSuccess(res, 'Message created successfully', message, 201);
    } catch (error: any) {
      sendError(res, error.message || 'Failed to create message', 400);
    }
  }

  async getAll(_req: Request, res: Response): Promise<void> {
    try {
      const messages = await this.communicationService.getAll();
      sendSuccess(res, 'Messages retrieved successfully', messages);
    } catch (error: any) {
      sendError(res, error.message || 'Failed to retrieve messages', 500);
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const message = await this.communicationService.getById(id);
      if (!message) {
        sendError(res, 'Message not found', 404);
        return;
      }
      sendSuccess(res, 'Message retrieved successfully', message);
    } catch (error: any) {
      sendError(res, error.message || 'Failed to retrieve message', 500);
    }
  }

  async getByOrderId(req: Request, res: Response): Promise<void> {
    try {
      const { orderId } = req.params;
      const messages = await this.communicationService.getByOrderId(orderId);
      sendSuccess(res, 'Messages retrieved successfully', messages);
    } catch (error: any) {
      sendError(res, error.message || 'Failed to retrieve messages', 500);
    }
  }
}
