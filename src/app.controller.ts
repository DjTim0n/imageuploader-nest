import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { AppService } from './app.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly configService: ConfigService,
  ) {}
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    const fileName = await this.appService.uploadImage(file);
    const uri =
      this.configService.get<string>('URL') || 'http://localhost:3000';
    return {
      url: `${uri}/images/${fileName}`,
    };
  }
  @Get('allImages')
  getImages() {
    return this.appService.getImages();
  }

  @Delete('deleteImage/:fileName')
  deleteImage(@Param('fileName') fileName: string) {
    return this.appService.deleteImage(fileName);
  }
}
