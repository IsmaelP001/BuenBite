import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Post,
  Put,
  Query,
  Req,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { Public } from "../../../adapters/decorators/public-recorator";
import { SocialFacade } from "../../application/services/interfaces/social";
import {
  CreateCommentDto,
  CreatePostDto,
  ShareRecipeDto,
  UpdateBioDto,
  UpdatePostDto,
} from "../../application/dto/social.dto";

@Controller("social")
export class SocialController {
  constructor(
    @Inject("SocialFacade")
    private readonly socialFacade: SocialFacade,
  ) {}

  @Get("feed")
  async getFeed(
    @Req() req: any,
    @Query("followingOnly") followingOnly?: string,
    @Query("limit") limit?: string,
    @Query("page") page?: string,
  ) {
    return this.socialFacade.getFeed(req.userId, followingOnly === "true", {
      limit: limit ? Number(limit) : undefined,
      page: page ? Number(page) : undefined,
    });
  }

  @Post("posts")
  @UseInterceptors(FileInterceptor("image"))
  async createPost(
    @Req() req: any,
    @UploadedFile() image: Express.Multer.File,
    @Body() body: any,
  ) {
      console.log("Received create post request with data:", {
      userId: req.userId,
      content: body?.content,
      image: image
        ? {
            originalname: image.originalname,
            mimetype: image.mimetype,
            size: image.size,
          }
        : body?.image,
      recipeId: body?.recipeId,
      postType: body?.postType,
      isPublic: body?.isPublic,
    });
    const metadata =
      typeof body?.metadata === "string"
        ? this.safeParseJson(body.metadata)
        : body?.metadata;

  

    return this.socialFacade.createPost({
      content: body?.content ?? "",
      image: image
        ? {
            buffer: image.buffer,
            fieldname: image.fieldname,
            originalName: image.originalname,
            mimetype: image.mimetype,
            size: image.size,
            path: "",
          }
        : body?.image,
      recipeId: body?.recipeId || undefined,
      metadata: metadata ?? undefined,
      postType: body?.postType || undefined,
      isPublic:
        typeof body?.isPublic === "string"
          ? body.isPublic === "true"
          : body?.isPublic,
      userId: req.userId,
    });
  }

  @Put("posts/:postId")
  async updatePost(
    @Req() req: any,
    @Param("postId") postId: string,
    @Body() body: Omit<UpdatePostDto, "id" | "userId">,
  ) {
    return this.socialFacade.updatePost({
      ...body,
      id: postId,
      userId: req.userId,
    });
  }

  @Delete("posts/:postId")
  async deletePost(@Req() req: any, @Param("postId") postId: string) {
    return this.socialFacade.deletePost(postId, req.userId);
  }

  @Get("posts/:postId")
  async getPostById(@Req() req: any, @Param("postId") postId: string) {
    return this.socialFacade.getPostById(postId, req.userId);
  }

  @Get("posts/user/:userId")
  async getUserPosts(
    @Req() req: any,
    @Param("userId") userId: string,
    @Query("limit") limit?: string,
    @Query("page") page?: string,
  ) {
    return this.socialFacade.getUserPosts(
      userId,
      {
        limit: limit ? Number(limit) : undefined,
        page: page ? Number(page) : undefined,
      },
      req.userId,
    );
  }

  // ══════════════════════════════════════════════════════════════════
  // ── Comments ──────────────────────────────────────────────────────
  // ══════════════════════════════════════════════════════════════════

  @Post("posts/:postId/comments")
  async addComment(
    @Req() req: any,
    @Param("postId") postId: string,
    @Body() body: { content: string; parentCommentId?: string },
  ) {
    const dto: CreateCommentDto = {
      userId: req.userId,
      postId,
      content: body.content,
      parentCommentId: body.parentCommentId,
    };
    return this.socialFacade.addComment(dto);
  }

  @Delete("comments/:commentId")
  async deleteComment(@Req() req: any, @Param("commentId") commentId: string) {
    return this.socialFacade.deleteComment(commentId, req.userId);
  }

  @Get("posts/:postId/comments")
  async getPostComments(
    @Req() req: any,
    @Param("postId") postId: string,
    @Query("limit") limit?: string,
    @Query("page") page?: string,
  ) {
    return this.socialFacade.getPostComments(
      postId,
      {
        limit: limit ? Number(limit) : undefined,
        page: page ? Number(page) : undefined,
      },
      req.userId,
    );
  }

  // ══════════════════════════════════════════════════════════════════
  // ── Likes ─────────────────────────────────────────────────────────
  // ══════════════════════════════════════════════════════════════════

  @Post("posts/:postId/like")
  async likePost(@Req() req: any, @Param("postId") postId: string) {
    return this.socialFacade.likePost(req.userId, postId);
  }

  @Delete("posts/:postId/like")
  async unlikePost(@Req() req: any, @Param("postId") postId: string) {
    return this.socialFacade.unlikePost(req.userId, postId);
  }

  @Post("comments/:commentId/like")
  async likeComment(@Req() req: any, @Param("commentId") commentId: string) {
    return this.socialFacade.likeComment(req.userId, commentId);
  }

  @Delete("comments/:commentId/like")
  async unlikeComment(@Req() req: any, @Param("commentId") commentId: string) {
    return this.socialFacade.unlikeComment(req.userId, commentId);
  }

  // ══════════════════════════════════════════════════════════════════
  // ── Follows ───────────────────────────────────────────────────────
  // ══════════════════════════════════════════════════════════════════

  @Post("follow/:userId")
  async followUser(@Req() req: any, @Param("userId") userId: string) {
    return this.socialFacade.followUser(req.userId, userId);
  }

  @Delete("follow/:userId")
  async unfollowUser(@Req() req: any, @Param("userId") userId: string) {
    return this.socialFacade.unfollowUser(req.userId, userId);
  }

  @Get("followers/:userId")
  async getFollowers(
    @Param("userId") userId: string,
    @Query("limit") limit?: string,
    @Query("page") page?: string,
  ) {
    return this.socialFacade.getFollowers(userId, {
      limit: limit ? Number(limit) : undefined,
      page: page ? Number(page) : undefined,
    });
  }

  @Get("following/:userId")
  async getFollowing(
    @Param("userId") userId: string,
    @Query("limit") limit?: string,
    @Query("page") page?: string,
  ) {
    return this.socialFacade.getFollowing(userId, {
      limit: limit ? Number(limit) : undefined,
      page: page ? Number(page) : undefined,
    });
  }

  // ══════════════════════════════════════════════════════════════════
  // ── Profile ───────────────────────────────────────────────────────
  // ══════════════════════════════════════════════════════════════════

  @Get("profile/:userId")
  async getUserProfile(@Req() req: any, @Param("userId") userId: string) {
    return this.socialFacade.getUserProfile(userId, req.userId);
  }

  @Get("profile/:userId/gamification")
  async getUserGamificationSummary(@Param("userId") userId: string) {
    return this.socialFacade.getUserGamificationSummary(userId);
  }

  @Get("profile/:userId/stats")
  async getUserStats(@Param("userId") userId: string) {
    return this.socialFacade.getUserStats(userId);
  }

  @Put("profile/bio")
  async updateBio(@Req() req: any, @Body() body: { bio: string }) {
    return this.socialFacade.updateUserBio(req.userId, body.bio);
  }

  // ══════════════════════════════════════════════════════════════════
  // ── Achievements ──────────────────────────────────────────────────
  // ══════════════════════════════════════════════════════════════════

  @Get("achievements")
  async getAchievements() {
    return this.socialFacade.getAchievements();
  }

  @Get("achievements/:userId")
  async getUserAchievements(@Param("userId") userId: string) {
    return this.socialFacade.getUserAchievements(userId);
  }

  // ══════════════════════════════════════════════════════════════════
  // ── Notifications ─────────────────────────────────────────────────
  // ══════════════════════════════════════════════════════════════════

  @Get("notifications")
  async getNotifications(
    @Req() req: any,
    @Query("unreadOnly") unreadOnly?: string,
    @Query("limit") limit?: string,
    @Query("page") page?: string,
  ) {
    return this.socialFacade.getNotifications(
      req.userId,
      unreadOnly === "true",
      {
        limit: limit ? Number(limit) : undefined,
        page: page ? Number(page) : undefined,
      },
    );
  }

  @Put("notifications/:notificationId/read")
  async markNotificationAsRead(
    @Param("notificationId") notificationId: string,
  ) {
    return this.socialFacade.markNotificationAsRead(notificationId);
  }

  @Put("notifications/read-all")
  async markAllNotificationsAsRead(@Req() req: any) {
    return this.socialFacade.markAllNotificationsAsRead(req.userId);
  }

  @Get("notifications/unread-count")
  async getUnreadNotificationCount(@Req() req: any) {
    const count = await this.socialFacade.getUnreadNotificationCount(
      req.userId,
    );
    return { count };
  }

  // ══════════════════════════════════════════════════════════════════
  // ── Explore & Trending ────────────────────────────────────────────
  // ══════════════════════════════════════════════════════════════════

  @Get("explore")
  async getExploreData(
    @Query("limit") limit?: string,
    @Query("period") period?: "week" | "month" | "all",
  ) {
    return this.socialFacade.getExploreData({
      limit: limit ? Number(limit) : undefined,
      period,
    });
  }

  @Get("trending/recipes")
  async getTrendingRecipes(
    @Query("limit") limit?: string,
    @Query("period") period?: "week" | "month" | "all",
  ) {
    return this.socialFacade.getTrendingRecipes({
      limit: limit ? Number(limit) : undefined,
      period,
    });
  }

  private safeParseJson(value: string): Record<string, any> | undefined {
    try {
      return JSON.parse(value);
    } catch {
      return undefined;
    }
  }

  // ══════════════════════════════════════════════════════════════════
  // ── Recipe Social Layer ───────────────────────────────────────────
  // ══════════════════════════════════════════════════════════════════

  @Get("recipe/:recipeId")
  async getRecipeSocialData(
    @Req() req: any,
    @Param("recipeId") recipeId: string,
  ) {
    return this.socialFacade.getRecipeSocialData(recipeId, req.userId);
  }

  // ══════════════════════════════════════════════════════════════════
  // ── Share ─────────────────────────────────────────────────────────
  // ══════════════════════════════════════════════════════════════════

  @Post("share")
  async shareRecipe(
    @Req() req: any,
    @Body() body: Omit<ShareRecipeDto, "userId">,
  ) {
    return this.socialFacade.shareRecipe({
      ...body,
      userId: req.userId,
    });
  }

  @Public()
  @Get("shared/:token")
  async getSharedRecipe(@Param("token") token: string) {
    return this.socialFacade.getSharedRecipeByToken(token);
  }

  // ══════════════════════════════════════════════════════════════════
  // ── Smart Social ──────────────────────────────────────────────────
  // ══════════════════════════════════════════════════════════════════

  @Get("insights")
  async getSocialInsights(@Req() req: any) {
    return this.socialFacade.getSocialInsights(req.userId);
  }

  // ══════════════════════════════════════════════════════════════════
  // ── Search ────────────────────────────────────────────────────────
  // ══════════════════════════════════════════════════════════════════

  @Get("search/users")
  async searchUsers(
    @Query("q") query: string,
    @Query("limit") limit?: string,
    @Query("page") page?: string,
  ) {
    return this.socialFacade.searchUsers(query, {
      limit: limit ? Number(limit) : undefined,
      page: page ? Number(page) : undefined,
    });
  }
}
