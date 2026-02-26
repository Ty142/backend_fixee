import { Types } from 'mongoose';
import { BaseService } from '../../core/services/base.service';
import { ActorModel, IActor, ActorStatus, ActorRole } from './actor.model';
import { OrderModel } from '../order/order.model';
import { PaymentModel } from '../payment/payment.model';
import { ServiceModel } from '../service/service.model';

export class ActorService extends BaseService<IActor> {
  constructor() {
    super(ActorModel);
  }

  async getByEmail(email: string): Promise<IActor | null> {
    return await this.model.findOne({ email: email.toLowerCase() }).exec();
  }

  async createAccount(data: {
    email: string;
    passwordHash: string;
    fullName: string;
    phoneNumber: string;
    role: ActorRole;
  }): Promise<IActor> {
    const actor = new this.model({
      ...data,
      email: data.email.toLowerCase(),
      status: ActorStatus.ACTIVE,
    });
    return await actor.save();
  }

  async updateProfile(
    id: string | Types.ObjectId,
    data: Partial<Pick<IActor, 'fullName' | 'phoneNumber' | 'avatarUrl'>>
  ): Promise<IActor | null> {
    return await this.model.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  async lockAccount(id: string | Types.ObjectId): Promise<IActor | null> {
    return await this.model
      .findByIdAndUpdate(id, { status: ActorStatus.SUSPENDED }, { new: true })
      .exec();
  }

  async unlockAccount(id: string | Types.ObjectId): Promise<IActor | null> {
    return await this.model
      .findByIdAndUpdate(id, { status: ActorStatus.ACTIVE }, { new: true })
      .exec();
  }

  async getStatistics(): Promise<{
    totalActors: number;
    actorsByRole: Record<string, number>;
    actorsByStatus: Record<string, number>;
    totalOrders: number;
    totalPayments: number;
    totalServices: number;
  }> {
    const [totalActors, actors, orders, payments, services] = await Promise.all([
      this.model.countDocuments().exec(),
      this.model.find().exec(),
      OrderModel.countDocuments().exec(),
      PaymentModel.countDocuments().exec(),
      ServiceModel.countDocuments().exec(),
    ]);

    const actorsByRole: Record<string, number> = {};
    const actorsByStatus: Record<string, number> = {};

    actors.forEach((actor) => {
      actorsByRole[actor.role] = (actorsByRole[actor.role] || 0) + 1;
      actorsByStatus[actor.status] = (actorsByStatus[actor.status] || 0) + 1;
    });

    return {
      totalActors,
      actorsByRole,
      actorsByStatus,
      totalOrders: orders,
      totalPayments: payments,
      totalServices: services,
    };
  }
}
