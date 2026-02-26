import { Request, Response } from 'express';
import { sendError } from '../interfaces/api-response';

export const notFoundHandler = (req: Request, res: Response): void => {
  sendError(res, `Route ${req.method} ${req.path} not found`, 404);
};
