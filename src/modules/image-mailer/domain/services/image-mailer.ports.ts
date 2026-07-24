export const IMAGE_PICKER = Symbol('IMAGE_PICKER');
export const MAILER = Symbol('MAILER');
export const SEND_LOG_REPOSITORY = Symbol('SEND_LOG_REPOSITORY');

export interface PickedImage {
  fileName: string;
  absolutePath: string;
}


export interface IImagePicker {
  pickRandom(recentlySentFileNames: string[]): Promise<PickedImage>;
}

export interface IMailer {
    sendImageToSubscribers(recipients: string[], image: PickedImage): Promise<{ successCount: number; failedEmails: string[] }>;
}

export interface ISendLogRepository {
    save(fileName: string, total: number, success: number, failed: string[]): Promise<void>;
    findRecentFileNames(weeksBack: number): Promise<string[]>;
}