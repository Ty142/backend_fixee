import { Request, Response } from 'express';
import { Types } from 'mongoose';
import { ReviewService } from './review.service';
import { sendSuccess, sendError } from '../../interfaces/api-response';
import { ReviewStatus } from './review.model';

export class ReviewController {
  private reviewService: ReviewService;

  constructor() {
    this.reviewService = new ReviewService();
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const { orderId, reviewerId, targetActorId, rating, comment } = req.body;
      const review = await this.reviewService.create({
        orderId: new Types.ObjectId(orderId),
        reviewerId: new Types.ObjectId(reviewerId),
        targetActorId: new Types.ObjectId(targetActorId),
        rating,
        comment,
      });
      sendSuccess(res, 'Review created successfully', review, 201);
    } catch (error: any) {
      sendError(res, error.message || 'Failed to create review', 400);
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const review = await this.reviewService.getById(id);
      if (!review) {
        sendError(res, 'Review not found', 404);
        return;
      }
      sendSuccess(res, 'Review retrieved successfully', review);
    } catch (error: any) {
      sendError(res, error.message || 'Failed to retrieve review', 500);
    }
  }

  async getByService(req: Request, res: Response): Promise<void> {
    try {
      const { serviceId } = req.params;
      const reviews = await this.reviewService.getByServiceId(serviceId);
      sendSuccess(res, 'Reviews retrieved successfully', reviews);
    } catch (error: any) {
      sendError(res, error.message || 'Failed to retrieve reviews', 500);
    }
  }

  async getAll(_req: Request, res: Response): Promise<void> {
    try {
      const reviews = await this.reviewService.getAll();
      sendSuccess(res, 'Reviews retrieved successfully', reviews);
    } catch (error: any) {
      sendError(res, error.message || 'Failed to retrieve reviews', 500);
    }
  }

  async moderate(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const review = await this.reviewService.moderate(id, status as ReviewStatus);
      if (!review) {
        sendError(res, 'Review not found', 404);
        return;
      }
      sendSuccess(res, 'Review moderated successfully', review);
    } catch (error: any) {
      sendError(res, error.message || 'Failed to moderate review', 400);
    }
  }
}
