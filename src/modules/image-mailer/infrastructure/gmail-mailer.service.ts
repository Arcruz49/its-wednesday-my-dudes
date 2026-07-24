import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { IMailer, PickedImage } from '../domain/services/image-mailer.ports';

@Injectable()
export class GmailMailerService implements IMailer {
  private readonly logger = new Logger(GmailMailerService.name);
  private readonly transporter: nodemailer.Transporter;
  private readonly fromAddress: string;

  constructor(private readonly configService: ConfigService) {
    this.fromAddress = this.configService.getOrThrow<string>('GMAIL_USER');

    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.fromAddress,
        pass: this.configService.getOrThrow<string>('GMAIL_APP_PASSWORD'),
      },
    });
  }

  async sendImageToSubscribers(
    recipients: string[],
    image: PickedImage,
  ): Promise<{ successCount: number; failedEmails: string[] }> {
    const failedEmails: string[] = [];
    let successCount = 0;


    for (const recipient of recipients) {
      try {
        await this.transporter.sendMail({
          from: `Weekly Image <${this.fromAddress}>`,
          to: recipient,
          subject: 'Sua imagem aleatoria da semana',
          text: 'Segue a imagem aleatoria desta semana, em anexo.',
          attachments: [
            {
              filename: image.fileName,
              path: image.absolutePath,
            },
          ],
        });
        successCount += 1;
      } catch (error) {
        this.logger.error(`Falha ao enviar para ${recipient}: ${error}`);
        failedEmails.push(recipient);
      }
    }

    return { successCount, failedEmails };
  }
}