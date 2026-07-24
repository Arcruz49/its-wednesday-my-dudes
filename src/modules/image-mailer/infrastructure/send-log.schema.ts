import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Model } from 'mongoose';
import { ISendLogRepository } from '../domain/services/image-mailer.ports';

export type SendLogDocument = SendLogModel & Document;

@Schema({ collection: 'send_logs' })
export class SendLogModel {
  @Prop({ required: true })
  imageFileName!: string;

  @Prop({ required: true })
  totalSubscribers!: number;

  @Prop({ required: true })
  successCount!: number;

  @Prop({ type: [String], default: [] })
  failedEmails!: string[];

  @Prop({ required: true, default: () => new Date() })
  createdAt!: Date;
}

export const SendLogSchema = SchemaFactory.createForClass(SendLogModel);

@Injectable()
export class SendLogRepository implements ISendLogRepository {
  constructor(
    @InjectModel(SendLogModel.name)
    private readonly model: Model<SendLogDocument>,
  ) {}

  async save(
    imageFileName: string,
    totalSubscribers: number,
    successCount: number,
    failedEmails: string[],
  ): Promise<void> {
    await this.model.create({
      imageFileName,
      totalSubscribers,
      successCount,
      failedEmails,
    });
  }

  async findRecentFileNames(weeksBack: number): Promise<string[]> {
    const since = new Date();
    since.setDate(since.getDate() - weeksBack * 7);

    const logs = await this.model
      .find({ createdAt: { $gte: since } })
      .select('imageFileName')
      .exec();

    return logs.map((log) => log.imageFileName);
  }
}