import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import sharp from 'sharp';

@Injectable()
export class AppService {
  async uploadImage(file: Express.Multer.File) {
    const outputDir = path.join(process.cwd(), 'uploads');
    const fileName =
      file.originalname.trim().replace(/\s/g, '_').split('.')[0] + '.webp';
    const imageBuffer = await sharp(file.buffer).toFormat('webp').toBuffer();
    fs.writeFileSync(path.join(outputDir, fileName), imageBuffer);
    return fileName;
  }
}
