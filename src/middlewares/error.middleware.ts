import { Request, Response, NextFunction } from 'express';
import { sendError } from '../interfaces/api-response';

export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error('Error:', err);

  if (res.headersSent) {
    return next(err);
  }

  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal server error';

  sendError(res, message, statusCode, err.data || null);
};
