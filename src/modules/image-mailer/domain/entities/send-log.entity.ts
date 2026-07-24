import { BaseEntity } from 'src/shared/domain/base-entity';

export class SendLog extends BaseEntity {
  private constructor(
    id: string,
    private readonly _imageFileName: string,
    private readonly _totalSubscribers: number,
    private readonly _successCount: number,
    private readonly _failedEmails: string[],
    createdAt?: Date,
  ) {
    super(id, createdAt);
  }

  static create(id: string, imageFileName: string, totalSubscribers: number, successCount: number, failedEmails: string[]): SendLog {
    return new SendLog(
      id,
      imageFileName,
      totalSubscribers,
      successCount,
      failedEmails,
    );
  }

  get imageFileName(): string {
    return this._imageFileName;
  }

  get successCount(): number {
    return this._successCount;
  }

  get failedEmails(): string[] {
    return this._failedEmails;
  }

  get totalSubscribers(): number {
    return this._totalSubscribers;
  }
}