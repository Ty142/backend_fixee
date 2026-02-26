import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_CONFIG } from '../config/jwt';
import { sendError } from '../interfaces/api-response';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      sendError(res, 'Authentication required', 401);
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    try {
      const decoded = jwt.verify(token, JWT_CONFIG.SECRET) as { id: string; role: string };
      req.user = {
        id: decoded.id,
        role: decoded.role,
      };
      next();
    } catch (error) {
      sendError(res, 'Invalid or expired token', 401);
      return;
    }
  } catch (error: any) {
    sendError(res, 'Authentication failed', 401);
    return;
  }
};
