import { Injectable, Inject } from "@nestjs/common";
import {
  UploadedImage,
  UploadedImageDto,
  UploadResult,
} from "../../domain/upload";
import { UploadFacade, UploadService } from "../services/interfaces/upload";

@Injectable()
export class UploadFacadeImpl implements UploadFacade {
  constructor(
    @Inject("UploadService")
    private readonly uploadService: UploadService
  ) {}
  deleteImage(data: string[]): Promise<boolean> {
    return this.uploadService.deleteImage(data);
  }

  generatePath(file: UploadedImageDto): string {
    const fileType = file.mimetype.split('/')?.[1];
    const fileName = `image-${Date.now()}.${fileType}`;
    const folder = file?.folder ? file.folder : 'images'
    return `${folder}/${fileName}`;
  }

  async uploadImage(image: UploadedImageDto): Promise<UploadResult> {
    const path = this.generatePath(image);
    const imageToUpload: UploadedImage = {
      ...image,
      path: path,
    };
    return await this.uploadService.uploadImage(imageToUpload);
  }
}
