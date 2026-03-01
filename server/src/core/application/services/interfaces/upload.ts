import { UploadedImage, UploadedImageDto, UploadResult } from "../../../domain/upload";

export interface UploadService {
  uploadImage(data: UploadedImage): Promise<UploadResult>;
  deleteImage(data: string[]): Promise<boolean>;
  getImageUrl(data: string): Promise<string>;
}

export interface UploadFacade {
  uploadImage(data: UploadedImageDto): Promise<UploadResult>;
  deleteImage(data: string[]): Promise<boolean>;
}
