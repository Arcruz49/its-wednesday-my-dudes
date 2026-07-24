import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SubscriberModule } from '../../subscribers/presentation/subscribers.module';
import {
  SendLogModel,
  SendLogSchema,
  SendLogRepository,
} from '../infrastructure/send-log.schema';
import { GmailMailerService } from '../infrastructure/gmail-mailer.service';
import { LocalFolderImagePickerService } from '../infrastructure/local-folder-image-picker.service';
import {
  IMAGE_PICKER,
  MAILER,
  SEND_LOG_REPOSITORY,
} from '../domain/services/image-mailer.ports';
import { SendWeeklyImageUseCase } from '../application/use-cases/send-weekly-image.use-case';
import { ImageMailerController } from './image-mailer.controller';
import { WeeklyImageScheduler } from './weekly-image.scheduler';

@Module({
  imports: [
    SubscriberModule,
    MongooseModule.forFeature([
      { name: SendLogModel.name, schema: SendLogSchema },
    ]),
  ],
  controllers: [ImageMailerController],
  providers: [
    SendWeeklyImageUseCase,
    WeeklyImageScheduler,
    { provide: IMAGE_PICKER, useClass: LocalFolderImagePickerService },
    { provide: MAILER, useClass: GmailMailerService },
    { provide: SEND_LOG_REPOSITORY, useClass: SendLogRepository },
  ],
})
export class ImageMailerModule {}
