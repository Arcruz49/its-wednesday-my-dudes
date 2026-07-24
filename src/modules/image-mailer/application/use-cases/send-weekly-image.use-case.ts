import { Inject, Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { IUseCase } from 'src/shared/application/use-case.interface';
import type {
  IImagePicker,
  IMailer,
  ISendLogRepository,
} from '../../domain/services/image-mailer.ports';
import {
  IMAGE_PICKER,
  MAILER,
  SEND_LOG_REPOSITORY,
} from '../../domain/services/image-mailer.ports';
import { SendLog } from '../../domain/entities/send-log.entity';
import type { ISubscriberRepository } from '../../../subscribers/domain/repositories/subscriber.repository.interface';
import { SUBSCRIBER_REPOSITORY } from '../../../subscribers/domain/repositories/subscriber.repository.interface';

const WEEKS_TO_AVOID_REPEATS = 8;

export interface SendWeeklyImageResponse {
  imageFileName: string;
  totalSubscribers: number;
  successCount: number;
  failedEmails: string[];
}

@Injectable()
export class SendWeeklyImageUseCase
  implements IUseCase<void, SendWeeklyImageResponse>
{
  private readonly logger = new Logger(SendWeeklyImageUseCase.name);

  constructor(
    @Inject(SUBSCRIBER_REPOSITORY)
    private readonly subscriberRepository: ISubscriberRepository,
    @Inject(IMAGE_PICKER)
    private readonly imagePicker: IImagePicker,
    @Inject(MAILER)
    private readonly mailer: IMailer,
    @Inject(SEND_LOG_REPOSITORY)
    private readonly sendLogRepository: ISendLogRepository,
  ) {}

  async execute(): Promise<SendWeeklyImageResponse> {
    const subscribers = await this.subscriberRepository.findAllActive();

    if (subscribers.length === 0) {
      this.logger.warn('Nenhum subscriber ativo. Envio cancelado.');
      return {
        imageFileName: '',
        totalSubscribers: 0,
        successCount: 0,
        failedEmails: [],
      };
    }

    const recentFileNames = await this.sendLogRepository.findRecentFileNames(
      WEEKS_TO_AVOID_REPEATS,
    );

    const image = await this.imagePicker.pickRandom(recentFileNames);

    const emails = subscribers.map((s) => s.email);
    const { successCount, failedEmails } = await this.mailer.sendImageToSubscribers(emails, image);

    const sendLog = SendLog.create(randomUUID(), image.fileName, subscribers.length, successCount, failedEmails);

    await this.sendLogRepository.save(
      sendLog.imageFileName,
      sendLog.totalSubscribers,
      sendLog.successCount,
      sendLog.failedEmails,
    );

    this.logger.log(`Envio concluido: ${successCount}/${subscribers.length} com sucesso (imagem: ${image.fileName})`);

    return {
      imageFileName: image.fileName,
      totalSubscribers: subscribers.length,
      successCount,
      failedEmails,
    };
  }
}