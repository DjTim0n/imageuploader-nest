import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import sharp from 'sharp';

@Injectable()
export class AppService {
  constructor(private readonly configService: ConfigService) {}
  async uploadImage(file: Express.Multer.File) {
    const outputDir = path.join(process.cwd(), 'uploads');
    const fileName =
      file.originalname.trim().replace(/\s/g, '_').split('.')[0] + '.webp';
    const imageBuffer = await sharp(file.buffer).toFormat('webp').toBuffer();
    fs.writeFileSync(path.join(outputDir, fileName), imageBuffer);
    return fileName;
  }
  async getImages() {
    function getDirectorySize(dirPath) {
      let totalSize = 0;

      const files = fs.readdirSync(dirPath);
      for (const file of files) {
        const filePath = path.join(dirPath, file);
        const stats = fs.statSync(filePath);

        if (stats.isDirectory()) {
          // Если это директория, рекурсивно вызываем функцию
          totalSize += getDirectorySize(filePath);
        } else {
          // Если это файл, добавляем его размер
          totalSize += stats.size;
        }
      }

      return totalSize;
    }

    const outputDir = path.join(process.cwd(), 'uploads');
    const totalSize = getDirectorySize(outputDir) / 1024 + ' KB';
    const allFiles = fs.readdirSync(outputDir);
    const uri =
      this.configService.get<string>('URL') || 'http://localhost:3000';
    const allUrls = allFiles.map((file) => {
      return {
        url: `${uri}/images/${file}`,
        sizeKB: fs.statSync(path.join(outputDir, file)).size / 1024 + ' KB',
      };
    });
    return {
      allFiles: allUrls,
      totalSize,
    };
  }

  async deleteImage(fileName: string) {
    const outputDir = path.join(process.cwd(), 'uploads');
    const filePath = path.join(outputDir, fileName);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return {
        message: 'File deleted',
        status: 200,
      };
    }
    return {
      message: 'File not found',
      status: 404,
    };
  }
}
