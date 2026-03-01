import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Body,
  BadRequestException,
  Inject,
  Req,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { UploadFacade } from "../../application/services/interfaces/upload";
import { UploadedImage, UploadedImageDto } from "../../domain/upload";

interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

@Controller("upload")
export class UploadController {
  constructor(
    @Inject("UploadFacade")
    private readonly uploadFacade: UploadFacade
  ) {}

  @Post("images")
  @UseInterceptors(FileInterceptor("image"))
  async uploadImage(
    @UploadedFile() file: MulterFile,
    @Body("metadata") metadata?: string
  ) {
    if (!file) {
      throw new BadRequestException("No file provided");
    }

    const uploadedImage: UploadedImageDto = {
      buffer: file.buffer,
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      fieldname: file.fieldname,
    };

    return await this.uploadFacade.uploadImage(uploadedImage);
  }
}
