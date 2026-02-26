import { ActorService } from '../actor/actor.service';
import { ActorModel, IActor, ActorRole } from '../actor/actor.model';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { JWT_CONFIG } from '../../config/jwt';

export interface LoginResult {
  accessToken: string;
  user: {
    id: string;
    email: string;
    fullName: string;
    role: ActorRole;
  };
}

export class AuthService {
  private actorService: ActorService;

  constructor() {
    this.actorService = new ActorService();
  }

  async login(email: string, password: string): Promise<LoginResult> {
    const actor = await this.actorService.getByEmail(email);
    if (!actor) {
      throw new Error('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, actor.passwordHash);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    if (actor.status !== 'ACTIVE') {
      throw new Error('Account is not active');
    }

    const payload = { id: actor._id.toString(), role: actor.role };
    const secret = JWT_CONFIG.SECRET;
    const options = { expiresIn: JWT_CONFIG.ACCESS_TOKEN_EXPIRES_IN } as jwt.SignOptions;
    const accessToken = jwt.sign(payload, secret, options);

    return {
      accessToken,
      user: {
        id: actor._id.toString(),
        email: actor.email,
        fullName: actor.fullName,
        role: actor.role,
      },
    };
  }

  async register(data: {
    email: string;
    password: string;
    fullName: string;
    phoneNumber: string;
    role: ActorRole;
  }): Promise<IActor> {
    const existingActor = await this.actorService.getByEmail(data.email);
    if (existingActor) {
      throw new Error('Email already registered');
    }

    const passwordHash = await bcrypt.hash(data.password, 10);

    return await this.actorService.createAccount({
      email: data.email,
      passwordHash,
      fullName: data.fullName,
      phoneNumber: data.phoneNumber,
      role: data.role,
    });
  }

  async refresh(refreshToken: string): Promise<{ accessToken: string }> {
    // Refresh token logic - uses HTTP-only cookie
    // For MVP, simplified implementation
    const decoded = jwt.verify(refreshToken, JWT_CONFIG.REFRESH_SECRET) as {
      id: string;
      role: string;
    };

    const actor = await ActorModel.findById(decoded.id).exec();
    if (!actor) {
      throw new Error('Invalid refresh token');
    }

    const payload = { id: actor._id.toString(), role: actor.role };
    const secret = JWT_CONFIG.SECRET;
    const options = { expiresIn: JWT_CONFIG.ACCESS_TOKEN_EXPIRES_IN } as jwt.SignOptions;
    const accessToken = jwt.sign(payload, secret, options);

    return { accessToken };
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    const actor = await this.actorService.getByEmail(email);
    if (!actor) {
      // Don't reveal if email exists for security
      return { message: 'If the email exists, an OTP code has been sent.' };
    }

    // Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await ActorModel.findByIdAndUpdate(actor._id, {
      otpCode,
      otpExpiresAt,
    }).exec();

    // TODO: Send OTP via email when mail module is implemented
    // For now, log it (remove in production)
    console.log(`OTP for ${email}: ${otpCode}`);

    return { message: 'If the email exists, an OTP code has been sent.' };
  }

  async verifyOtp(email: string, otpCode: string): Promise<{ resetToken: string }> {
    const actor = await this.actorService.getByEmail(email);
    if (!actor) {
      throw new Error('Invalid OTP code');
    }

    if (!actor.otpCode || actor.otpCode !== otpCode) {
      throw new Error('Invalid OTP code');
    }

    if (!actor.otpExpiresAt || actor.otpExpiresAt < new Date()) {
      throw new Error('OTP code has expired');
    }

    // Generate reset token
    const resetToken = jwt.sign(
      { id: actor._id.toString(), type: 'reset' },
      JWT_CONFIG.SECRET,
      { expiresIn: '1h' } as jwt.SignOptions
    );

    const resetTokenExpiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await ActorModel.findByIdAndUpdate(actor._id, {
      resetToken,
      resetTokenExpiresAt,
      otpCode: undefined,
      otpExpiresAt: undefined,
    }).exec();

    return { resetToken };
  }

  async resetPassword(resetToken: string, newPassword: string): Promise<{ message: string }> {
    let decoded: { id: string; type: string };
    try {
      decoded = jwt.verify(resetToken, JWT_CONFIG.SECRET) as { id: string; type: string };
    } catch (error) {
      throw new Error('Invalid or expired reset token');
    }

    if (decoded.type !== 'reset') {
      throw new Error('Invalid reset token');
    }

    const actor = await ActorModel.findById(decoded.id).exec();
    if (!actor) {
      throw new Error('Invalid reset token');
    }

    if (!actor.resetToken || actor.resetToken !== resetToken) {
      throw new Error('Invalid reset token');
    }

    if (!actor.resetTokenExpiresAt || actor.resetTokenExpiresAt < new Date()) {
      throw new Error('Reset token has expired');
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    await ActorModel.findByIdAndUpdate(actor._id, {
      passwordHash,
      resetToken: undefined,
      resetTokenExpiresAt: undefined,
    }).exec();

    return { message: 'Password reset successfully' };
  }

  async changePassword(
    actorId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<{ message: string }> {
    const actor = await ActorModel.findById(actorId).exec();
    if (!actor) {
      throw new Error('User not found');
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, actor.passwordHash);
    if (!isPasswordValid) {
      throw new Error('Current password is incorrect');
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    await ActorModel.findByIdAndUpdate(actorId, { passwordHash }).exec();

    return { message: 'Password changed successfully' };
  }
}
