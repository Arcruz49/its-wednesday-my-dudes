import { Controller, Post, HttpCode } from '@nestjs/common';
import { SendWeeklyImageUseCase } from '../application/use-cases/send-weekly-image.use-case';

@Controller('image-mailer')
export class ImageMailerController {
  constructor(
    private readonly sendWeeklyImageUseCase: SendWeeklyImageUseCase,
  ) {}

  @Post('send')
  @HttpCode(200)
  async send() {
    return this.sendWeeklyImageUseCase.execute();
  }
}
