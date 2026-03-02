import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Post,
  Query,
  Req,
} from "@nestjs/common";
import { Public } from "../../../adapters/decorators/public-recorator";
import { GamificationFacade } from "../../application/services/interfaces/gamification";
import {
  ClaimChallengeDto,
  EmitGamificationEventDto,
  GetChallengesDto,
  GetLeaderboardDto,
  GetPointsHistoryDto,
  JoinChallengeDto,
} from "../../application/dto/gamification.dto";
import { GamificationAction } from "../../domain/gamification.model";

@Controller("gamification")
export class GamificationController {
  constructor(
    @Inject("GamificationFacade")
    private readonly gamificationFacade: GamificationFacade,
  ) {}

  // ══════════════════════════════════════════════════════════════════
  // ── Profile ───────────────────────────────────────────────────────
  // ══════════════════════════════════════════════════════════════════

  @Get("profile")
  async getMyProfile(@Req() req: any) {
    return this.gamificationFacade.getGamificationProfile(req.userId);
  }

  @Get("profile/:userId")
  async getUserProfile(@Param("userId") userId: string) {
    return this.gamificationFacade.getGamificationProfile(userId);
  }

  // ══════════════════════════════════════════════════════════════════
  // ── Summary (lightweight XP / level) ──────────────────────────────
  // ══════════════════════════════════════════════════════════════════

  @Get("summary")
  async getMySummary(@Req() req: any) {
    return this.gamificationFacade.getGamificationSummary(req.userId);
  }

  @Get("summary/:userId")
  async getUserSummary(@Param("userId") userId: string) {
    return this.gamificationFacade.getGamificationSummary(userId);
  }

  // ══════════════════════════════════════════════════════════════════
  // ── Points History ────────────────────────────────────────────────
  // ══════════════════════════════════════════════════════════════════

  @Get("points/history")
  async getPointsHistory(
    @Req() req: any,
    @Query("action") action?: string,
    @Query("masteryCategory") masteryCategory?: string,
    @Query("fromDate") fromDate?: string,
    @Query("toDate") toDate?: string,
    @Query("page") page?: string,
    @Query("limit") limit?: string,
  ) {
    return this.gamificationFacade.getPointsHistory(
      {
        userId: req.userId,
        action: action as GamificationAction | undefined,
        masteryCategory: masteryCategory as any,
        fromDate: fromDate ? new Date(fromDate) : undefined,
        toDate: toDate ? new Date(toDate) : undefined,
      },
      {
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
      },
    );
  }

  // ══════════════════════════════════════════════════════════════════
  // ── Emit Event (manual trigger for testing / internal use) ────────
  // ══════════════════════════════════════════════════════════════════

  @Post("events")
  async emitEvent(
    @Req() req: any,
    @Body() body: Omit<EmitGamificationEventDto, "userId">,
  ) {
    return this.gamificationFacade.emitGamificationEvent({
      userId: req.userId,
      action: body.action,
      referenceId: body.referenceId,
      referenceType: body.referenceType,
      metadata: body.metadata,
      timestamp: new Date(),
    });
  }

  // ══════════════════════════════════════════════════════════════════
  // ── Streaks ───────────────────────────────────────────────────────
  // ══════════════════════════════════════════════════════════════════

  @Get("streaks")
  async getMyStreaks(@Req() req: any) {
    return this.gamificationFacade.getUserStreaks(req.userId);
  }

  @Get("streaks/:userId")
  async getUserStreaks(@Param("userId") userId: string) {
    return this.gamificationFacade.getUserStreaks(userId);
  }

  // ══════════════════════════════════════════════════════════════════
  // ── Milestones ────────────────────────────────────────────────────
  // ══════════════════════════════════════════════════════════════════

  @Get("milestones")
  @Public()
  async getAllMilestones() {
    return this.gamificationFacade.getAllMilestones();
  }

  @Get("milestones/user")
  async getMyMilestones(@Req() req: any) {
    return this.gamificationFacade.getUserMilestones(req.userId);
  }

  @Get("milestones/user/:userId")
  async getUserMilestones(@Param("userId") userId: string) {
    return this.gamificationFacade.getUserMilestones(userId);
  }

  // ══════════════════════════════════════════════════════════════════
  // ── Mastery ───────────────────────────────────────────────────────
  // ══════════════════════════════════════════════════════════════════

  @Get("mastery")
  async getMyMasteries(@Req() req: any) {
    return this.gamificationFacade.getUserMasteries(req.userId);
  }

  @Get("mastery/:userId")
  async getUserMasteries(@Param("userId") userId: string) {
    return this.gamificationFacade.getUserMasteries(userId);
  }

  // ══════════════════════════════════════════════════════════════════
  // ── Weekly Titles ─────────────────────────────────────────────────
  // ══════════════════════════════════════════════════════════════════

  @Get("weekly-title")
  async getMyWeeklyTitle(@Req() req: any) {
    return this.gamificationFacade.getCurrentWeeklyTitle(req.userId);
  }

  @Get("weekly-title/history")
  async getMyWeeklyTitleHistory(
    @Req() req: any,
    @Query("limit") limit?: string,
  ) {
    return this.gamificationFacade.getWeeklyTitleHistory(
      req.userId,
      limit ? Number(limit) : undefined,
    );
  }

  // ══════════════════════════════════════════════════════════════════
  // ── Leaderboard ───────────────────────────────────────────────────
  // ══════════════════════════════════════════════════════════════════

  @Get("leaderboard")
  async getLeaderboard(
    @Query("period") period?: string,
    @Query("page") page?: string,
    @Query("limit") limit?: string,
  ) {
    return this.gamificationFacade.getLeaderboard({
      period: (period as "week" | "month" | "all") ?? "week",
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
  }

  // ══════════════════════════════════════════════════════════════════
  // ── Challenges ────────────────────────────────────────────────────
  // ══════════════════════════════════════════════════════════════════

  @Get("challenges")
  async getActiveChallenges(
    @Query("type") type?: string,
  ) {
    return this.gamificationFacade.getActiveChallenges({
      type: type as any,
      activeOnly: true,
    });
  }

  @Get("challenges/user")
  async getMyChallenges(
    @Req() req: any,
    @Query("activeOnly") activeOnly?: string,
  ) {
    return this.gamificationFacade.getUserChallenges(
      req.userId,
      activeOnly === "true",
    );
  }

  @Post("challenges/:challengeId/join")
  async joinChallenge(
    @Req() req: any,
    @Param("challengeId") challengeId: string,
  ) {
    return this.gamificationFacade.joinChallenge(req.userId, challengeId);
  }

  @Post("challenges/:challengeId/claim")
  async claimChallengeReward(
    @Req() req: any,
    @Param("challengeId") challengeId: string,
  ) {
    return this.gamificationFacade.claimChallengeReward(
      req.userId,
      challengeId,
    );
  }

  // ══════════════════════════════════════════════════════════════════
  // ── Alerts (Notificaciones de logros) ─────────────────────────────
  // ══════════════════════════════════════════════════════════════════

  @Get("alerts")
  async getMyAlerts(@Req() req: any) {
    return this.gamificationFacade.getUserAlerts(req.userId);
  }

  @Delete("alerts/:alertId")
  async dismissAlert(
    @Req() req: any,
    @Param("alertId") alertId: string,
  ) {
    await this.gamificationFacade.dismissAlert(alertId, req.userId);
    return { success: true };
  }

  @Delete("alerts")
  async dismissAllAlerts(@Req() req: any) {
    await this.gamificationFacade.dismissAllAlerts(req.userId);
    return { success: true };
  }
}
