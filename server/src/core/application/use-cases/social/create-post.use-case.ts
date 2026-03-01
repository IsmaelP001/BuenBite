import { Inject, Injectable } from "@nestjs/common";
import { v4 as uuidv4 } from "uuid";
import { CacheKeys } from "../../../../shared/cache-keys-const";
import { SocialRepository } from "../../../domain/repositories";
import { SocialPost, PostType } from "../../../domain/social.model";
import { UploadedImage } from "../../../domain/upload";
import { CreatePostDto } from "../../dto/social.dto";
import { RedisCacheService } from "../../services/redis-cache.service";
import { UploadService } from "../../services/interfaces/upload";

@Injectable()
export class CreatePostUseCase {
  constructor(
    @Inject("SocialRepository")
    private readonly socialRepository: SocialRepository,
    @Inject("UploadService")
    private readonly uploadService: UploadService,
    private readonly redisCacheService: RedisCacheService,
  ) {}

  async execute(dto: CreatePostDto): Promise<SocialPost> {
    let uploadedImagePath: string | undefined;
    let uploadedImageUrl: string | null = null;

    if (dto.image && typeof dto.image !== "string") {
      const imageToUpload = this.mapImageForUpload(dto.image);
      const uploadResult = await this.uploadService.uploadImage(imageToUpload);
      uploadedImagePath = uploadResult.path;
      uploadedImageUrl = uploadResult.publicUrl;
    } else if (typeof dto.image === "string") {
      uploadedImageUrl = dto.image;
    }

    const post: SocialPost = {
      id: uuidv4(),
      userId: dto.userId,
      postType: dto.postType ?? PostType.MANUAL,
      activityType: null,
      content: dto.content,
      image: uploadedImageUrl,
      recipeId: dto.recipeId ?? null,
      metadata: dto.metadata ?? null,
      isPublic: dto.isPublic ?? true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    console.log("Creating post with data:", {
      ...post,
      image: uploadedImageUrl ? "[IMAGE_URL]" : null,
    });

    try {
      const created = await this.socialRepository.createPost(post);
      await this.invalidatePostRelatedCaches(dto.userId);
      return created;
    } catch (error) {
      if (uploadedImagePath) {
        await this.uploadService.deleteImage([uploadedImagePath]);
      }
      throw error;
    }
  }

  private mapImageForUpload(image: UploadedImage): UploadedImage {
    const extension = image.mimetype.split("/")?.[1] || "jpg";
    return {
      ...image,
      path: `social/posts/image-${Date.now()}-${uuidv4()}.${extension}`,
    };
  }

  private async invalidatePostRelatedCaches(userId: string): Promise<void> {
    await this.redisCacheService.invalidatePrefix(CacheKeys.SOCIAL.FEED_PREFIX);
    await this.redisCacheService.invalidatePrefix(
      CacheKeys.SOCIAL.POSTS_PREFIX,
    );

    await this.redisCacheService.invalidateMultiple([
      CacheKeys.SOCIAL.STATS(userId),
      CacheKeys.SOCIAL.STATS_POSTS_COUNT(userId),
    ]);
  }
}
