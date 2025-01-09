import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import sharp from 'sharp';

@Injectable()
export class UploadSerivce {
  async compressImage(
    file: Express.Multer.File,
    w: number = 100,
    h: number = 100,
    q: number = 75,
  ): Promise<string> {
    const outputDir = path.join(process.cwd(), 'uploads/compress');
    const imageBuffer = sharp(file.buffer);

    const metadata = await imageBuffer.metadata();
    const { width, height, format } = metadata;
    const isFormatValid = ['webp'].includes(format || '');
    const processedImage = isFormatValid
      ? imageBuffer
      : imageBuffer.toFormat('webp');

    if (width != w || height != h) {
      processedImage.resize({
        width: w,
        height: h,
        fit: 'cover',
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      });
    }

    const compressedImageBuffer = await processedImage
      .webp({ quality: q })
      .toBuffer();
    const fileName = file.originalname.split('.')[0] + '.webp';
    const filePath = path.join(outputDir, fileName);

    fs.writeFileSync(filePath, compressedImageBuffer);
    return fileName;
  }
}
