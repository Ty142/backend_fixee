import { Types } from 'mongoose';
import { BaseService } from '../../core/services/base.service';
import { LocationModel, ILocation } from './location.model';

export class LocationService extends BaseService<ILocation> {
  constructor() {
    super(LocationModel);
  }

  async getById(id: string | Types.ObjectId): Promise<ILocation | null> {
    return await this.model.findById(id).populate('actorId').exec();
  }

  async getAll(): Promise<ILocation[]> {
    return await this.model.find().populate('actorId').sort({ createdAt: -1 }).exec();
  }

  async getByActorId(actorId: string | Types.ObjectId): Promise<ILocation[]> {
    return await this.model
      .find({ actorId })
      .sort({ isDefault: -1, createdAt: -1 })
      .exec();
  }
}
