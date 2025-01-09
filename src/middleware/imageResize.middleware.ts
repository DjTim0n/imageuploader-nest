import { Injectable, NestMiddleware } from '@nestjs/common';
import sharp from 'sharp';
import * as fs from 'fs';
import * as path from 'path';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class ImageProcessingMiddleware implements NestMiddleware {
  async use(req: Request, res: Response, next: NextFunction) {
    console.log('Middleware triggered:', req.url);
    const { w, h, q } = req.query;
    console.log(w, h, q);
    if (req.url.startsWith('/images/') && (w || h || q)) {
      try {
        console.log(req.url);
        const filePath = path.join(
          process.cwd(),
          'uploads',
          req.url.split('?')[0].split('/').slice(2).join('/'),
        );
        console.log(
          '🚀 ~ ImageProcessingMiddleware ~ use ~ filePath:',
          filePath,
        );

        if (!fs.existsSync(filePath)) {
          return res.status(404).send('Файл не найден');
        }

        const fileBuffer = fs.readFileSync(filePath);

        const processedImage = await sharp(fileBuffer)
          .resize({
            width: +w,
            height: +h,
            fit: 'cover',
            background: { r: 0, g: 0, b: 0, alpha: 0 },
          })
          .toFormat('webp', { quality: +q || 100 })
          .toBuffer();

        res.setHeader('Content-Type', 'image/webp');
        return res.send(processedImage);
      } catch (error) {
        console.error('Ошибка обработки изображения:', error);
        return res.status(500).send('Ошибка обработки изображения');
      }
    } else if (req.url.startsWith('/images/')) {
      try {
        const filePath = path.join(
          process.cwd(),
          'uploads',
          req.url.split('?')[0].split('/').slice(2).join('/'),
        );
        if (!fs.existsSync(filePath)) {
          return res.status(404).send('Файл не найден');
        }

        const fileBuffer = fs.readFileSync(filePath);
        const processedImage = await sharp(fileBuffer)
          .toFormat('webp')
          .toBuffer();

        res.setHeader('Content-Type', 'image/webp');
        return res.send(processedImage);
      } catch (error) {
        console.error('Ошибка обработки изображения:', error);
        return res.status(500).send('Ошибка обработки изображения');
      }
    }
    next();
  }
}
