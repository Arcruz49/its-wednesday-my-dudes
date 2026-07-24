import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SendWeeklyImageUseCase } from '../application/use-cases/send-weekly-image.use-case';

@Injectable()
export class WeeklyImageScheduler {
  private readonly logger = new Logger(WeeklyImageScheduler.name);

  constructor(
    private readonly sendWeeklyImageUseCase: SendWeeklyImageUseCase,
  ) {}

  // Toda quarta-feira às 09:00 (horário de São Paulo).
  // Ajuste o cron/timeZone conforme necessário.
  @Cron('0 9 * * 3', { timeZone: 'America/Sao_Paulo' })
  async handleWeeklySend(): Promise<void> {
    this.logger.log('Disparo semanal (quarta-feira) iniciado.');
    try {
      const result = await this.sendWeeklyImageUseCase.execute();
      this.logger.log(
        `Disparo semanal concluido: ${result.successCount}/${result.totalSubscribers}`,
      );
    } catch (error) {
      this.logger.error(`Falha no disparo semanal: ${error}`);
    }
  }
}
