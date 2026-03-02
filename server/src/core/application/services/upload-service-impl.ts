import { Inject, Injectable } from "@nestjs/common";
import { UploadRepository } from "../../domain/repositories";
import { UploadedImage } from "../../domain/upload";
import { UploadService } from "./interfaces/upload";

@Injectable()
export class UploadServiceImpl implements UploadService {
  constructor(
    @Inject("UploadRepository")
    private imageRepository: UploadRepository) {}

  deleteImage(path: string[]): Promise<boolean> {
    return this.imageRepository.deleteImage(path)
  }
  getImageUrl(path: string): Promise<string> {
    return this.imageRepository.getImageUrl(path);
  }

  async uploadImage(file: UploadedImage): Promise<any> {
    let imageUrl: string = "";
    const result = await this.imageRepository.uploadImage(file);
    imageUrl = result.publicUrl;
    return result;
  }
}
