import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { readdir } from 'fs/promises';
import { join, resolve } from 'path';
import { IImagePicker, PickedImage } from '../domain/services/image-mailer.ports';

const VALID_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];

@Injectable()
export class LocalFolderImagePickerService implements IImagePicker {
  private readonly folderPath: string;

  constructor(private readonly configService: ConfigService) {
    // resolve garante que caminhos relativos (ex.: ./images) fiquem
    // ancorados na raiz do projeto (cwd), sem depender de caminho absoluto.
    this.folderPath = resolve(
      this.configService.getOrThrow<string>('IMAGES_FOLDER_PATH'),
    );
  }

  async pickRandom(recentlySentFileNames: string[]): Promise<PickedImage> {
    const allFiles = await readdir(this.folderPath);
    const imageFiles = allFiles.filter((file) =>
      VALID_EXTENSIONS.includes(this.extensionOf(file)),
    );

    if (imageFiles.length === 0) {
      throw new InternalServerErrorException(
        `Nenhuma imagem encontrada em ${this.folderPath}`,
      );
    }

    const availableFiles = imageFiles.filter(
      (file) => !recentlySentFileNames.includes(file),
    );

    // se todas foram enviadas limpa a pool de imagens
    const pool = availableFiles.length > 0 ? availableFiles : imageFiles;

    const chosen = pool[Math.floor(Math.random() * pool.length)];

    return {
      fileName: chosen,
      absolutePath: join(this.folderPath, chosen),
    };
  }

  private extensionOf(fileName: string): string {
    const lastDot = fileName.lastIndexOf('.');
    return lastDot === -1 ? '' : fileName.slice(lastDot).toLowerCase();
  }
}