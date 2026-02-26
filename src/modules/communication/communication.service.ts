import { Types } from 'mongoose';
import { BaseService } from '../../core/services/base.service';
import { CommunicationModel, ICommunication } from './communication.model';

export class CommunicationService extends BaseService<ICommunication> {
  constructor() {
    super(CommunicationModel);
  }

  async getById(id: string | Types.ObjectId): Promise<ICommunication | null> {
    return await this.model
      .findById(id)
      .populate('orderId')
      .populate('senderId')
      .populate('receiverId')
      .exec();
  }

  async getAll(): Promise<ICommunication[]> {
    return await this.model
      .find()
      .populate('orderId')
      .populate('senderId')
      .populate('receiverId')
      .sort({ createdAt: -1 })
      .exec();
  }

  async createMessage(data: {
    orderId: Types.ObjectId;
    senderId: Types.ObjectId;
    receiverId: Types.ObjectId;
    content: string;
    type?: string;
  }): Promise<ICommunication> {
    const message = new this.model({
      ...data,
      type: data.type || 'TEXT',
    });
    return await message.save();
  }

  async getByOrderId(orderId: string | Types.ObjectId): Promise<ICommunication[]> {
    return await this.model
      .find({ orderId })
      .populate('senderId')
      .populate('receiverId')
      .sort({ createdAt: -1 })
      .exec();
  }
}
