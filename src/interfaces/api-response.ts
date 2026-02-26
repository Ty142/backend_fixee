import { Response } from 'express';

export interface ApiResponse<T> {
  status: 'success' | 'error';
  message: string;
  data: T | null;
  timestamp: string;
}

export function sendResponse<T>(
  res: Response,
  statusCode: number,
  status: 'success' | 'error',
  message: string,
  data: T | null = null
): void {
  const response: ApiResponse<T> = {
    status,
    message,
    data,
    timestamp: new Date().toISOString(),
  };
  res.status(statusCode).json(response);
}

export function sendSuccess<T>(
  res: Response,
  message: string,
  data: T | null = null,
  statusCode: number = 200
): void {
  sendResponse(res, statusCode, 'success', message, data);
}

export function sendError(
  res: Response,
  message: string,
  statusCode: number = 400,
  data: any = null
): void {
  sendResponse(res, statusCode, 'error', message, data);
}
