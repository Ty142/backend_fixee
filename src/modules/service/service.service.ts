import { Types } from 'mongoose';
import { BaseService } from '../../core/services/base.service';
import { ServiceModel, IService } from './service.model';

export class ServiceService extends BaseService<IService> {
  constructor() {
    super(ServiceModel);
  }

  async getActiveServices(): Promise<IService[]> {
    return await this.model.find({ isActive: true }).populate('createdBy').exec();
  }

  async getById(id: string | Types.ObjectId): Promise<IService | null> {
    return await this.model.findById(id).populate('createdBy').exec();
  }

  async activate(id: string | Types.ObjectId): Promise<IService | null> {
    return await this.model
      .findByIdAndUpdate(id, { isActive: true }, { new: true })
      .exec();
  }

  async deactivate(id: string | Types.ObjectId): Promise<IService | null> {
    return await this.model
      .findByIdAndUpdate(id, { isActive: false }, { new: true })
      .exec();
  }
}
