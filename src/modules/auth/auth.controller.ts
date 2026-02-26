import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { AuthService } from "./auth.service";
import { sendSuccess, sendError } from "../../interfaces/api-response";
import { ActorRole } from "../actor/actor.model";
import { JWT_CONFIG } from "../../config/jwt";
// import { authenticate } from '../../middlewares/auth.middleware';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
      const result = await this.authService.login(email, password);

      // Set refresh token in HTTP-only cookie
      const payload = { id: result.user.id, role: result.user.role };
      const secret = JWT_CONFIG.REFRESH_SECRET;
      const options = { expiresIn: JWT_CONFIG.REFRESH_TOKEN_EXPIRES_IN };
      const refreshToken = jwt.sign(
        payload,
        secret,
        options as jwt.SignOptions,
      );

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days (matches JWT_CONFIG.REFRESH_TOKEN_EXPIRES_IN)
      });

      sendSuccess(res, "Login successful", result);
    } catch (error: any) {
      sendError(res, error.message || "Login failed", 401);
    }
  }

  async register(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, fullName, phoneNumber } = req.body;
      const actor = await this.authService.register({
        email,
        password,
        fullName,
        phoneNumber,
        role: "USER" as ActorRole,
      });
      sendSuccess(res, "Registration successful", actor, 201);
    } catch (error: any) {
      sendError(res, error.message || "Registration failed", 400);
    }
  }

  async refresh(req: Request, res: Response): Promise<void> {
    try {
      const refreshToken = req.cookies.refreshToken;
      if (!refreshToken) {
        sendError(res, "Refresh token not found", 401);
        return;
      }

      const result = await this.authService.refresh(refreshToken);
      sendSuccess(res, "Token refreshed successfully", result);
    } catch (error: any) {
      sendError(res, error.message || "Token refresh failed", 401);
    }
  }

  async logout(_req: Request, res: Response): Promise<void> {
    try {
      res.clearCookie("refreshToken");
      sendSuccess(res, "Logout successful", null);
    } catch (error: any) {
      sendError(res, error.message || "Logout failed", 500);
    }
  }

  async forgotPassword(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;
      if (!email) {
        sendError(res, "Email is required", 400);
        return;
      }
      const result = await this.authService.forgotPassword(email);
      sendSuccess(res, result.message, result);
    } catch (error: any) {
      sendError(
        res,
        error.message || "Failed to process forgot password request",
        400,
      );
    }
  }

  async verifyOtp(req: Request, res: Response): Promise<void> {
    try {
      const { email, otpCode } = req.body;
      if (!email || !otpCode) {
        sendError(res, "Email and OTP code are required", 400);
        return;
      }
      const result = await this.authService.verifyOtp(email, otpCode);
      sendSuccess(res, "OTP verified successfully", result);
    } catch (error: any) {
      sendError(res, error.message || "OTP verification failed", 400);
    }
  }

  async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      const { token, newPassword } = req.body;
      if (!token || !newPassword) {
        sendError(res, "Token and new password are required", 400);
        return;
      }
      if (newPassword.length < 6) {
        sendError(res, "Password must be at least 6 characters", 400);
        return;
      }
      const result = await this.authService.resetPassword(token, newPassword);
      sendSuccess(res, result.message, result);
    } catch (error: any) {
      sendError(res, error.message || "Password reset failed", 400);
    }
  }

  async changePassword(
    req: Request & { user?: { id: string } },
    res: Response,
  ): Promise<void> {
    try {
      const { currentPassword, newPassword } = req.body;
      if (!currentPassword || !newPassword) {
        sendError(res, "Current password and new password are required", 400);
        return;
      }
      if (newPassword.length < 6) {
        sendError(res, "New password must be at least 6 characters", 400);
        return;
      }
      if (!req.user?.id) {
        sendError(res, "Authentication required", 401);
        return;
      }
      const result = await this.authService.changePassword(
        req.user.id,
        currentPassword,
        newPassword,
      );
      sendSuccess(res, result.message, result);
    } catch (error: any) {
      sendError(res, error.message || "Password change failed", 400);
    }
  }
}
