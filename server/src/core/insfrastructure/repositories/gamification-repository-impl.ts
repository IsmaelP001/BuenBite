import { Injectable, Logger } from "@nestjs/common";
import {
  and,
  count,
  desc,
  eq,
  gte,
  inArray,
  lte,
  sql,
  sum,
} from "drizzle-orm";
import { db } from "../../../config/drizzle/db";
import {
  challengesSchema,
  gamificationAlertsSchema,
  milestonesSchema,
  pointsLogSchema,
  userChallengesSchema,
  userGamificationSchema,
  userMasterySchema,
  userMilestonesSchema,
  userStreaksSchema,
  usersSchema,
  weeklyChefTitlesSchema,
} from "../../../config/drizzle/schemas";
import { PaginationParams } from "../../../shared/dto/input";
import { PaginatedResponse } from "../../../shared/dto/response";
import { GamificationRepository } from "../../domain/repositories";
import {
  Challenge,
  ChallengeFilter,
  GamificationAction,
  ChallengeStatus,
  GLOBAL_LEVELS,
  getGlobalLevel,
  getMasteryLevelForXp,
  getNextMasteryLevel,
  LeaderboardFilter,
  MasteryCategory,
  MasteryLevel,
  Milestone,
  GamificationAlert,
  GamificationAlertType,
  PointsLog,
  PointsLogFilter,
  UserChallenge,
  UserMasteryProgress,
  UserMilestone,
  UserStreak,
  WeeklyChefTitle,
  WeeklyRanking,
} from "../../domain/gamification.model";
import { v4 as uuid } from "uuid";
import { format, startOfDay, startOfWeek, endOfWeek } from "date-fns";

@Injectable()
export class GamificationRepositoryImpl implements GamificationRepository {
  private readonly logger = new Logger(GamificationRepositoryImpl.name);

  // ══════════════════════════════════════════════════════════════════
  // ── Points (operaciones atómicas) ─────────────────────────────────
  // ══════════════════════════════════════════════════════════════════

  async logPoints(data: PointsLog): Promise<PointsLog> {
    const [result] = await db
      .insert(pointsLogSchema)
      .values({
        id: data.id,
        userId: data.userId,
        action: data.action,
        basePoints: data.basePoints,
        streakMultiplier: data.streakMultiplier,
        totalPoints: data.totalPoints,
        masteryCategory: data.masteryCategory,
        masteryXpGained: data.masteryXpGained,
        referenceId: data.referenceId,
        referenceType: data.referenceType,
        metadata: data.metadata,
      })
      .returning();

    return this.mapPointsLog(result);
  }

  async getPointsLog(
    filter: PointsLogFilter,
    pagination: PaginationParams,
  ): Promise<PaginatedResponse<PointsLog>> {
    const page = pagination.page ?? 1;
    const limit = pagination.limit ?? 20;
    const offset = (page - 1) * limit;

    const conditions = [eq(pointsLogSchema.userId, filter.userId)];

    if (filter.action) {
      conditions.push(eq(pointsLogSchema.action, filter.action));
    }
    if (filter.masteryCategory) {
      conditions.push(eq(pointsLogSchema.masteryCategory, filter.masteryCategory));
    }
    if (filter.fromDate) {
      conditions.push(gte(pointsLogSchema.createdAt, filter.fromDate));
    }
    if (filter.toDate) {
      conditions.push(lte(pointsLogSchema.createdAt, filter.toDate));
    }

    const whereClause = and(...conditions);

    const [items, [totalResult]] = await Promise.all([
      db
        .select()
        .from(pointsLogSchema)
        .where(whereClause)
        .orderBy(desc(pointsLogSchema.createdAt))
        .limit(limit)
        .offset(offset),
      db
        .select({ count: count() })
        .from(pointsLogSchema)
        .where(whereClause),
    ]);

    const total = totalResult?.count ?? 0;

    return {
      items: items.map(this.mapPointsLog),
      hasMore: page * limit < total,
      page,
    };
  }

  async getUserTotalXp(userId: string): Promise<number> {
    const [result] = await db
      .select({ total: sum(pointsLogSchema.totalPoints) })
      .from(pointsLogSchema)
      .where(eq(pointsLogSchema.userId, userId));
    return Number(result?.total ?? 0);
  }

  async getUserXpForPeriod(userId: string, from: Date, to: Date): Promise<number> {
    const [result] = await db
      .select({ total: sum(pointsLogSchema.totalPoints) })
      .from(pointsLogSchema)
      .where(
        and(
          eq(pointsLogSchema.userId, userId),
          gte(pointsLogSchema.createdAt, from),
          lte(pointsLogSchema.createdAt, to),
        ),
      );
    return Number(result?.total ?? 0);
  }

  async getUserXpToday(userId: string): Promise<number> {
    const todayStart = startOfDay(new Date());
    const [result] = await db
      .select({ total: sum(pointsLogSchema.totalPoints) })
      .from(pointsLogSchema)
      .where(
        and(
          eq(pointsLogSchema.userId, userId),
          gte(pointsLogSchema.createdAt, todayStart),
        ),
      );
    return Number(result?.total ?? 0);
  }

  // ══════════════════════════════════════════════════════════════════
  // ── Gamification Summary (CRUD atómico) ───────────────────────────
  // ══════════════════════════════════════════════════════════════════

  /**
   * Obtiene la fila de user_gamification. Retorna null si no existe.
   * NO orquesta llamadas a streaks, milestones, etc.
   */
  async getGamificationSummary(userId: string): Promise<{
    userId: string;
    totalXp: number;
    globalLevel: number;
    globalLevelName: string;
    pointsThisWeek: number;
    pointsToday: number;
    weeklyRank: number | null;
  } | null> {
    const [row] = await db
      .select()
      .from(userGamificationSchema)
      .where(eq(userGamificationSchema.userId, userId))
      .limit(1);

    if (!row) return null;

    return {
      userId: row.userId,
      totalXp: row.totalXp,
      globalLevel: row.globalLevel,
      globalLevelName: row.globalLevelName,
      pointsThisWeek: row.pointsThisWeek,
      pointsToday: row.pointsToday,
      weeklyRank: row.weeklyRank,
    };
  }

  /**
   * Crea la fila de user_gamification si no existe. Operación idempotente.
   */
  async ensureGamificationSummaryExists(userId: string): Promise<void> {
    await db
      .insert(userGamificationSchema)
      .values({
        id: uuid(),
        userId,
        totalXp: 0,
        globalLevel: 1,
        globalLevelName: "Novato",
        pointsThisWeek: 0,
        pointsToday: 0,
      })
      .onConflictDoNothing({ target: userGamificationSchema.userId });
  }

  async updateGamificationSummary(
    userId: string,
    data: {
      totalXp?: number;
      pointsThisWeek?: number;
      pointsToday?: number;
      weeklyRank?: number | null;
    },
  ): Promise<void> {
    const globalLevel = data.totalXp !== undefined
      ? getGlobalLevel(data.totalXp)
      : undefined;

    await db
      .update(userGamificationSchema)
      .set({
        ...(data.totalXp !== undefined && { totalXp: data.totalXp }),
        ...(globalLevel && {
          globalLevel: globalLevel.level,
          globalLevelName: globalLevel.name,
        }),
        ...(data.pointsThisWeek !== undefined && {
          pointsThisWeek: data.pointsThisWeek,
        }),
        ...(data.pointsToday !== undefined && {
          pointsToday: data.pointsToday,
        }),
        ...(data.weeklyRank !== undefined && {
          weeklyRank: data.weeklyRank,
        }),
        updatedAt: new Date(),
      })
      .where(eq(userGamificationSchema.userId, userId));
  }

  async applyXpDelta(
    userId: string,
    deltaXp: number,
  ): Promise<{
    totalXp: number;
    globalLevel: number;
    globalLevelName: string;
  }> {
    const sortedLevels = [...GLOBAL_LEVELS].sort(
      (a, b) => b.requiredXp - a.requiredXp,
    );

    const levelCase = sql<number>`
      (CASE
        ${sql.join(
          sortedLevels.map(
            (level) =>
              sql`WHEN ${userGamificationSchema.totalXp} + ${deltaXp} >= ${level.requiredXp} THEN ${level.level}`,
          ),
          sql` `,
        )}
        ELSE ${GLOBAL_LEVELS[0].level}
      END)::integer
    `;

    const levelNameCase = sql<string>`
      (CASE
        ${sql.join(
          sortedLevels.map(
            (level) =>
              sql`WHEN ${userGamificationSchema.totalXp} + ${deltaXp} >= ${level.requiredXp} THEN ${level.name}`,
          ),
          sql` `,
        )}
        ELSE ${GLOBAL_LEVELS[0].name}
      END)::text
    `;

    const [updated] = await db
      .update(userGamificationSchema)
      .set({
        totalXp: sql`${userGamificationSchema.totalXp} + ${deltaXp}`,
        globalLevel: levelCase,
        globalLevelName: levelNameCase,
        updatedAt: new Date(),
      })
      .where(eq(userGamificationSchema.userId, userId))
      .returning({
        totalXp: userGamificationSchema.totalXp,
        globalLevel: userGamificationSchema.globalLevel,
        globalLevelName: userGamificationSchema.globalLevelName,
      });

    if (!updated) {
      await this.ensureGamificationSummaryExists(userId);

      const [retryUpdated] = await db
        .update(userGamificationSchema)
        .set({
          totalXp: sql`${userGamificationSchema.totalXp} + ${deltaXp}`,
          globalLevel: levelCase,
          globalLevelName: levelNameCase,
          updatedAt: new Date(),
        })
        .where(eq(userGamificationSchema.userId, userId))
        .returning({
          totalXp: userGamificationSchema.totalXp,
          globalLevel: userGamificationSchema.globalLevel,
          globalLevelName: userGamificationSchema.globalLevelName,
        });

      if (!retryUpdated) {
        throw new Error(`Failed to apply XP delta for user ${userId}`);
      }

      return {
        totalXp: retryUpdated.totalXp,
        globalLevel: retryUpdated.globalLevel,
        globalLevelName: retryUpdated.globalLevelName,
      };
    }

    return {
      totalXp: updated.totalXp,
      globalLevel: updated.globalLevel,
      globalLevelName: updated.globalLevelName,
    };
  }

  // ══════════════════════════════════════════════════════════════════
  // ── Streaks (operaciones atómicas) ────────────────────────────────
  // ══════════════════════════════════════════════════════════════════

  async getUserStreaks(userId: string): Promise<UserStreak[]> {
    const rows = await db
      .select()
      .from(userStreaksSchema)
      .where(eq(userStreaksSchema.userId, userId));
    return rows.map(this.mapStreak);
  }

  async getOrCreateStreak(userId: string, streakType: string): Promise<UserStreak> {
    const existing = await db
      .select()
      .from(userStreaksSchema)
      .where(
        and(
          eq(userStreaksSchema.userId, userId),
          eq(userStreaksSchema.streakType, streakType),
        ),
      )
      .limit(1);

    if (existing.length > 0) {
      return this.mapStreak(existing[0]);
    }

    const [result] = await db
      .insert(userStreaksSchema)
      .values({
        id: uuid(),
        userId,
        streakType,
        currentCount: 0,
        longestCount: 0,
        isActive: true,
      })
      .returning();

    return this.mapStreak(result);
  }

  /**
   * Atomic upsert that creates streak if missing AND applies date-based
   * streak logic (continue / reset) in a single query.
   * Replaces getOrCreateStreak + computeAndUpdateStreak (was 2-3 queries → 1).
   */
  async upsertAndUpdateStreak(
    userId: string,
    streakType: string,
    today: string,
    yesterday: string,
  ): Promise<UserStreak> {
    const [result] = await db
      .insert(userStreaksSchema)
      .values({
        id: uuid(),
        userId,
        streakType,
        currentCount: 1,
        longestCount: 1,
        lastActivityDate: today,
        isActive: true,
      })
      .onConflictDoUpdate({
        target: [userStreaksSchema.userId, userStreaksSchema.streakType],
        set: {
          currentCount: sql`CASE
            WHEN ${userStreaksSchema.lastActivityDate} = ${today} THEN ${userStreaksSchema.currentCount}
            WHEN ${userStreaksSchema.lastActivityDate} = ${yesterday} THEN ${userStreaksSchema.currentCount} + 1
            ELSE 1
          END`,
          longestCount: sql`GREATEST(${userStreaksSchema.longestCount}, CASE
            WHEN ${userStreaksSchema.lastActivityDate} = ${today} THEN ${userStreaksSchema.currentCount}
            WHEN ${userStreaksSchema.lastActivityDate} = ${yesterday} THEN ${userStreaksSchema.currentCount} + 1
            ELSE 1
          END)`,
          lastActivityDate: today,
          isActive: sql`true`,
          updatedAt: new Date(),
        },
      })
      .returning();

    return this.mapStreak(result);
  }

  async updateStreak(data: Partial<UserStreak> & { id: string }): Promise<UserStreak> {
    const [result] = await db
      .update(userStreaksSchema)
      .set({
        ...(data.currentCount !== undefined && {
          currentCount: data.currentCount,
        }),
        ...(data.longestCount !== undefined && {
          longestCount: data.longestCount,
        }),
        ...(data.lastActivityDate !== undefined && {
          lastActivityDate: data.lastActivityDate,
        }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
        updatedAt: new Date(),
      })
      .where(eq(userStreaksSchema.id, data.id))
      .returning();

    return this.mapStreak(result);
  }

  async resetInactiveStreaks(userId: string): Promise<void> {
    const yesterday = format(
      new Date(Date.now() - 86_400_000),
      "yyyy-MM-dd",
    );

    await db
      .update(userStreaksSchema)
      .set({
        currentCount: 0,
        isActive: false,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(userStreaksSchema.userId, userId),
          eq(userStreaksSchema.isActive, true),
          sql`${userStreaksSchema.lastActivityDate} < ${yesterday}`,
        ),
      );
  }

  // ══════════════════════════════════════════════════════════════════
  // ── Milestones (operaciones atómicas) ─────────────────────────────
  // ══════════════════════════════════════════════════════════════════

  async getAllMilestones(): Promise<Milestone[]> {
    const rows = await db.select().from(milestonesSchema);
    return rows.map(this.mapMilestone);
  }

  async getUserMilestones(userId: string): Promise<UserMilestone[]> {
    const rows = await db
      .select({
        userMilestone: userMilestonesSchema,
        milestone: milestonesSchema,
      })
      .from(userMilestonesSchema)
      .innerJoin(
        milestonesSchema,
        eq(userMilestonesSchema.milestoneId, milestonesSchema.id),
      )
      .where(eq(userMilestonesSchema.userId, userId))
      .orderBy(desc(userMilestonesSchema.unlockedAt));

    return rows.map((r) => ({
      ...this.mapUserMilestone(r.userMilestone),
      milestone: this.mapMilestone(r.milestone),
    }));
  }

  async getRecentMilestones(userId: string, limit: number): Promise<UserMilestone[]> {
    const rows = await db
      .select({
        userMilestone: userMilestonesSchema,
        milestone: milestonesSchema,
      })
      .from(userMilestonesSchema)
      .innerJoin(
        milestonesSchema,
        eq(userMilestonesSchema.milestoneId, milestonesSchema.id),
      )
      .where(eq(userMilestonesSchema.userId, userId))
      .orderBy(desc(userMilestonesSchema.unlockedAt))
      .limit(limit);

    return rows.map((r) => ({
      ...this.mapUserMilestone(r.userMilestone),
      milestone: this.mapMilestone(r.milestone),
    }));
  }

  async tryUnlockMilestone(data: UserMilestone): Promise<boolean> {
    const [result] = await db
      .insert(userMilestonesSchema)
      .values({
        id: data.id,
        userId: data.userId,
        milestoneId: data.milestoneId,
      })
      .onConflictDoNothing()
      .returning({ id: userMilestonesSchema.id });

    return Boolean(result?.id);
  }

  async unlockMilestone(data: UserMilestone): Promise<UserMilestone> {
    const [result] = await db
      .insert(userMilestonesSchema)
      .values({
        id: data.id,
        userId: data.userId,
        milestoneId: data.milestoneId,
      })
      .onConflictDoNothing()
      .returning();

    if (!result) {
      const [existing] = await db
        .select()
        .from(userMilestonesSchema)
        .where(
          and(
            eq(userMilestonesSchema.userId, data.userId),
            eq(userMilestonesSchema.milestoneId, data.milestoneId),
          ),
        );
      return this.mapUserMilestone(existing);
    }

    return this.mapUserMilestone(result);
  }

  async hasUserUnlockedMilestone(userId: string, milestoneType: string): Promise<boolean> {
    const [result] = await db
      .select({ count: count() })
      .from(userMilestonesSchema)
      .innerJoin(
        milestonesSchema,
        eq(userMilestonesSchema.milestoneId, milestonesSchema.id),
      )
      .where(
        and(
          eq(userMilestonesSchema.userId, userId),
          eq(milestonesSchema.type, milestoneType),
        ),
      );

    return (result?.count ?? 0) > 0;
  }

  // ══════════════════════════════════════════════════════════════════
  // ── Mastery (operaciones atómicas) ────────────────────────────────
  // ══════════════════════════════════════════════════════════════════

  async getUserMasteries(userId: string): Promise<UserMasteryProgress[]> {
    const rows = await db
      .select()
      .from(userMasterySchema)
      .where(eq(userMasterySchema.userId, userId));
    return rows.map((r) => this.mapMastery(r));
  }

  async getOrCreateMastery(userId: string, category: MasteryCategory): Promise<UserMasteryProgress> {
    const existing = await db
      .select()
      .from(userMasterySchema)
      .where(
        and(
          eq(userMasterySchema.userId, userId),
          eq(userMasterySchema.category, category),
        ),
      )
      .limit(1);

    if (existing.length > 0) {
      return this.mapMastery(existing[0]);
    }

    const [result] = await db
      .insert(userMasterySchema)
      .values({
        id: uuid(),
        userId,
        category,
        currentXp: 0,
        currentLevel: 1,
      })
      .returning();

    return this.mapMastery(result);
  }

  /**
   * Atomic upsert: creates mastery row if missing, returns existing if present.
   * Single query via ON CONFLICT DO UPDATE RETURNING (replaces SELECT + INSERT).
   */
  async upsertMastery(userId: string, category: MasteryCategory): Promise<UserMasteryProgress> {
    const [result] = await db
      .insert(userMasterySchema)
      .values({
        id: uuid(),
        userId,
        category,
        currentXp: 0,
        currentLevel: 1,
      })
      .onConflictDoUpdate({
        target: [userMasterySchema.userId, userMasterySchema.category],
        set: {
          // No-op update to trigger RETURNING on conflict
          updatedAt: sql`${userMasterySchema.updatedAt}`,
        },
      })
      .returning();

    return this.mapMastery(result);
  }

  async updateMastery(data: Partial<UserMasteryProgress> & { id: string }): Promise<UserMasteryProgress> {
    const [result] = await db
      .update(userMasterySchema)
      .set({
        ...(data.currentXp !== undefined && { currentXp: data.currentXp }),
        ...(data.currentLevel !== undefined && {
          currentLevel: data.currentLevel,
        }),
        updatedAt: new Date(),
      })
      .where(eq(userMasterySchema.id, data.id))
      .returning();

    return this.mapMastery(result);
  }

  // ══════════════════════════════════════════════════════════════════
  // ── Weekly Titles (operaciones atómicas) ──────────────────────────
  // ══════════════════════════════════════════════════════════════════

  async getWeeklyTitle(userId: string, weekStart: string): Promise<WeeklyChefTitle | null> {
    const [result] = await db
      .select()
      .from(weeklyChefTitlesSchema)
      .where(
        and(
          eq(weeklyChefTitlesSchema.userId, userId),
          eq(weeklyChefTitlesSchema.weekStartDate, weekStart),
        ),
      )
      .limit(1);

    return result ? this.mapWeeklyTitle(result) : null;
  }

  async assignWeeklyTitles(titles: WeeklyChefTitle[]): Promise<WeeklyChefTitle[]> {
    if (titles.length === 0) return [];

    const results = await db
      .insert(weeklyChefTitlesSchema)
      .values(
        titles.map((t) => ({
          id: t.id,
          userId: t.userId,
          title: t.title,
          weekStartDate: t.weekStartDate,
          weekEndDate: t.weekEndDate,
          rank: t.rank,
          xpEarned: t.xpEarned,
        })),
      )
      .onConflictDoNothing()
      .returning();

    return results.map(this.mapWeeklyTitle);
  }

  async getCurrentWeeklyTitle(userId: string): Promise<WeeklyChefTitle | null> {
    const now = new Date();
    const weekStart = format(startOfWeek(now, { weekStartsOn: 1 }), "yyyy-MM-dd");
    return this.getWeeklyTitle(userId, weekStart);
  }

  async getUserWeeklyTitleHistory(userId: string, limit = 10): Promise<WeeklyChefTitle[]> {
    const rows = await db
      .select()
      .from(weeklyChefTitlesSchema)
      .where(eq(weeklyChefTitlesSchema.userId, userId))
      .orderBy(desc(weeklyChefTitlesSchema.weekStartDate))
      .limit(limit);

    return rows.map(this.mapWeeklyTitle);
  }

  // ══════════════════════════════════════════════════════════════════
  // ── Leaderboard (queries atómicas, sin N+1) ───────────────────────
  // ══════════════════════════════════════════════════════════════════

  /**
   * Rankings crudos: agrega puntos y resuelve usuarios con batch.
   * Sin llamadas N+1.
   */
  async getLeaderboard(
    filter: LeaderboardFilter,
  ): Promise<PaginatedResponse<WeeklyRanking>> {
    const page = filter.page ?? 1;
    const limit = filter.limit ?? 20;
    const offset = (page - 1) * limit;

    let fromDate: Date;
    const now = new Date();

    if (filter.period === "week") {
      fromDate = startOfWeek(now, { weekStartsOn: 1 });
    } else if (filter.period === "month") {
      fromDate = new Date(now.getFullYear(), now.getMonth(), 1);
    } else {
      fromDate = new Date(0);
    }

    const rankings = await db
      .select({
        userId: pointsLogSchema.userId,
        weeklyXp: sum(pointsLogSchema.totalPoints),
      })
      .from(pointsLogSchema)
      .where(gte(pointsLogSchema.createdAt, fromDate))
      .groupBy(pointsLogSchema.userId)
      .orderBy(desc(sum(pointsLogSchema.totalPoints)))
      .limit(limit)
      .offset(offset);

    const [totalResult] = await db
      .select({
        count: sql<number>`COUNT(DISTINCT ${pointsLogSchema.userId})`,
      })
      .from(pointsLogSchema)
      .where(gte(pointsLogSchema.createdAt, fromDate));

    const total = Number(totalResult?.count ?? 0);

    if (rankings.length === 0) {
      return { items: [], hasMore: false, page };
    }

    // Batch: obtener info de usuarios
    const userIds = rankings.map((r) => r.userId);
    const usersMap = await this.getUsersBasicInfo(userIds);

    // Batch: obtener maestrías
    const masteriesMap = await this.getUserMasteriesBatch(userIds);

    const enriched: WeeklyRanking[] = rankings.map((r, idx) => {
      const user = usersMap.get(r.userId);
      return {
        userId: r.userId,
        fullName: user?.fullName ?? "Usuario",
        avatarUrl: user?.avatarUrl ?? null,
        weeklyXp: Number(r.weeklyXp ?? 0),
        rank: offset + idx + 1,
        currentTitle: null,
        masteryLevels: masteriesMap.get(r.userId) ?? [],
      };
    });

    return {
      items: enriched,
      hasMore: page * limit < total,
      page,
    };
  }

  async getWeeklyRankings(weekStart: string, limit = 10): Promise<WeeklyRanking[]> {
    const from = new Date(weekStart);
    const to = endOfWeek(from, { weekStartsOn: 1 });

    const rankings = await db
      .select({
        userId: pointsLogSchema.userId,
        weeklyXp: sum(pointsLogSchema.totalPoints),
      })
      .from(pointsLogSchema)
      .where(
        and(
          gte(pointsLogSchema.createdAt, from),
          lte(pointsLogSchema.createdAt, to),
        ),
      )
      .groupBy(pointsLogSchema.userId)
      .orderBy(desc(sum(pointsLogSchema.totalPoints)))
      .limit(limit);

    if (rankings.length === 0) return [];

    // Batch: obtener info de usuarios
    const userIds = rankings.map((r) => r.userId);
    const usersMap = await this.getUsersBasicInfo(userIds);
    const masteriesMap = await this.getUserMasteriesBatch(userIds);

    return rankings.map((r, idx) => {
      const user = usersMap.get(r.userId);
      return {
        userId: r.userId,
        fullName: user?.fullName ?? "Usuario",
        avatarUrl: user?.avatarUrl ?? null,
        weeklyXp: Number(r.weeklyXp ?? 0),
        rank: idx + 1,
        currentTitle: null,
        masteryLevels: masteriesMap.get(r.userId) ?? [],
      };
    });
  }

  // ══════════════════════════════════════════════════════════════════
  // ── Challenges (operaciones atómicas) ─────────────────────────────
  // ══════════════════════════════════════════════════════════════════

  async getActiveChallenges(filter?: ChallengeFilter): Promise<Challenge[]> {
    const conditions = [eq(challengesSchema.isActive, true)];

    if (filter?.type) {
      conditions.push(eq(challengesSchema.type, filter.type));
    }

    const rows = await db
      .select()
      .from(challengesSchema)
      .where(and(...conditions))
      .orderBy(desc(challengesSchema.createdAt));

    return rows.map(this.mapChallenge);
  }

  async getUserChallenges(userId: string, activeOnly = false): Promise<UserChallenge[]> {
    const conditions = [eq(userChallengesSchema.userId, userId)];

    if (activeOnly) {
      conditions.push(eq(userChallengesSchema.status, ChallengeStatus.ACTIVE));
    }

    const rows = await db
      .select({
        userChallenge: userChallengesSchema,
        challenge: challengesSchema,
      })
      .from(userChallengesSchema)
      .innerJoin(
        challengesSchema,
        eq(userChallengesSchema.challengeId, challengesSchema.id),
      )
      .where(and(...conditions))
      .orderBy(desc(userChallengesSchema.createdAt));

    return rows.map((r) => ({
      ...this.mapUserChallenge(r.userChallenge),
      challenge: this.mapChallenge(r.challenge),
    }));
  }

  async joinChallenge(userId: string, challengeId: string): Promise<UserChallenge> {
    const [result] = await db
      .insert(userChallengesSchema)
      .values({
        id: uuid(),
        userId,
        challengeId,
        currentProgress: 0,
        status: ChallengeStatus.ACTIVE,
      })
      .onConflictDoNothing()
      .returning();

    if (!result) {
      const [existing] = await db
        .select()
        .from(userChallengesSchema)
        .where(
          and(
            eq(userChallengesSchema.userId, userId),
            eq(userChallengesSchema.challengeId, challengeId),
          ),
        );
      return this.mapUserChallenge(existing);
    }

    return this.mapUserChallenge(result);
  }

  async incrementChallengeProgressForAction(
    userId: string,
    action: GamificationAction,
  ): Promise<{ updated: number; completed: number }> {
    const now = new Date();

    const rows = await db
      .update(userChallengesSchema)
      .set({
        currentProgress: sql`${userChallengesSchema.currentProgress} + 1`,
        status: sql`CASE
          WHEN ${userChallengesSchema.currentProgress} + 1 >= (
            SELECT ${challengesSchema.targetValue}
            FROM ${challengesSchema}
            WHERE ${challengesSchema.id} = ${userChallengesSchema.challengeId}
          ) THEN ${ChallengeStatus.COMPLETED}
          ELSE ${userChallengesSchema.status}
        END`,
        completedAt: sql`CASE
          WHEN ${userChallengesSchema.currentProgress} + 1 >= (
            SELECT ${challengesSchema.targetValue}
            FROM ${challengesSchema}
            WHERE ${challengesSchema.id} = ${userChallengesSchema.challengeId}
          ) THEN COALESCE(${userChallengesSchema.completedAt}, ${now})
          ELSE ${userChallengesSchema.completedAt}
        END`,
        updatedAt: now,
      })
      .where(
        and(
          eq(userChallengesSchema.userId, userId),
          eq(userChallengesSchema.status, ChallengeStatus.ACTIVE),
          sql`EXISTS (
            SELECT 1
            FROM ${challengesSchema}
            WHERE ${challengesSchema.id} = ${userChallengesSchema.challengeId}
              AND ${challengesSchema.action} = ${action}
          )`,
        ),
      )
      .returning({
        status: userChallengesSchema.status,
      });

    return {
      updated: rows.length,
      completed: rows.filter((row) => row.status === ChallengeStatus.COMPLETED)
        .length,
    };
  }

  async updateChallengeProgress(data: Partial<UserChallenge> & { id: string }): Promise<UserChallenge> {
    const [result] = await db
      .update(userChallengesSchema)
      .set({
        ...(data.currentProgress !== undefined && {
          currentProgress: data.currentProgress,
        }),
        ...(data.status !== undefined && { status: data.status }),
        ...(data.completedAt !== undefined && {
          completedAt: data.completedAt,
        }),
        ...(data.claimedAt !== undefined && { claimedAt: data.claimedAt }),
        updatedAt: new Date(),
      })
      .where(eq(userChallengesSchema.id, data.id))
      .returning();

    return this.mapUserChallenge(result);
  }

  async claimChallengeReward(userId: string, challengeId: string): Promise<UserChallenge> {
    const [result] = await db
      .update(userChallengesSchema)
      .set({
        status: ChallengeStatus.CLAIMED,
        claimedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(userChallengesSchema.userId, userId),
          eq(userChallengesSchema.challengeId, challengeId),
          eq(userChallengesSchema.status, ChallengeStatus.COMPLETED),
        ),
      )
      .returning();

    return this.mapUserChallenge(result);
  }

  async createChallenge(data: Challenge): Promise<Challenge> {
    const [result] = await db
      .insert(challengesSchema)
      .values({
        id: data.id,
        name: data.name,
        description: data.description,
        icon: data.icon,
        type: data.type,
        action: data.action,
        targetValue: data.targetValue,
        xpReward: data.xpReward,
        startDate: data.startDate,
        endDate: data.endDate,
        isActive: data.isActive,
      })
      .returning();

    return this.mapChallenge(result);
  }

  async expireOldChallenges(): Promise<number> {
    const now = new Date();

    const result = await db
      .update(userChallengesSchema)
      .set({
        status: ChallengeStatus.EXPIRED,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(userChallengesSchema.status, ChallengeStatus.ACTIVE),
          sql`${userChallengesSchema.challengeId} IN (
            SELECT ${challengesSchema.id} FROM ${challengesSchema}
            WHERE ${challengesSchema.endDate} < ${now}
          )`,
        ),
      )
      .returning();

    await db
      .update(challengesSchema)
      .set({ isActive: false })
      .where(
        and(
          eq(challengesSchema.isActive, true),
          lte(challengesSchema.endDate, now),
        ),
      );

    return result.length;
  }

  // ══════════════════════════════════════════════════════════════════
  // ── Action Counts (queries atómicas) ──────────────────────────────
  // ══════════════════════════════════════════════════════════════════

  async getUserActionCount(userId: string, action: string): Promise<number> {
    const [result] = await db
      .select({ count: count() })
      .from(pointsLogSchema)
      .where(
        and(
          eq(pointsLogSchema.userId, userId),
          eq(pointsLogSchema.action, action),
        ),
      );
    return result?.count ?? 0;
  }

  /**
   * Batch: counts multiple actions in a single GROUP BY query.
   * Replaces N individual getUserActionCount calls with 1 query.
   */
  async getUserActionCounts(userId: string, actions: string[]): Promise<Map<string, number>> {
    if (actions.length === 0) return new Map();

    const rows = await db
      .select({
        action: pointsLogSchema.action,
        count: count(),
      })
      .from(pointsLogSchema)
      .where(
        and(
          eq(pointsLogSchema.userId, userId),
          inArray(pointsLogSchema.action, actions),
        ),
      )
      .groupBy(pointsLogSchema.action);

    const result = new Map<string, number>();
    for (const row of rows) {
      result.set(row.action, row.count);
    }
    return result;
  }

  async getUserActionCountForPeriod(userId: string, action: string, from: Date, to: Date): Promise<number> {
    const [result] = await db
      .select({ count: count() })
      .from(pointsLogSchema)
      .where(
        and(
          eq(pointsLogSchema.userId, userId),
          eq(pointsLogSchema.action, action),
          gte(pointsLogSchema.createdAt, from),
          lte(pointsLogSchema.createdAt, to),
        ),
      );
    return result?.count ?? 0;
  }

  // ══════════════════════════════════════════════════════════════════
  // ── Batch enrichment helpers ──────────────────────────────────────
  // ══════════════════════════════════════════════════════════════════

  /**
   * Batch: obtiene info básica de múltiples usuarios en una sola query.
   * Elimina el patrón N+1 del leaderboard.
   */
  async getUsersBasicInfo(userIds: string[]): Promise<Map<string, { fullName: string; avatarUrl: string | null }>> {
    if (userIds.length === 0) return new Map();

    const rows = await db
      .select({
        id: usersSchema.id,
        fullName: usersSchema.fullName,
        avatarUrl: usersSchema.avatarUrl,
      })
      .from(usersSchema)
      .where(inArray(usersSchema.id, userIds));

    const map = new Map<string, { fullName: string; avatarUrl: string | null }>();
    for (const r of rows) {
      map.set(r.id, { fullName: r.fullName ?? "Usuario", avatarUrl: r.avatarUrl });
    }
    return map;
  }

  /**
   * Batch: obtiene maestrías de múltiples usuarios en una sola query.
   */
  private async getUserMasteriesBatch(userIds: string[]): Promise<Map<string, UserMasteryProgress[]>> {
    if (userIds.length === 0) return new Map();

    const rows = await db
      .select()
      .from(userMasterySchema)
      .where(inArray(userMasterySchema.userId, userIds));

    const map = new Map<string, UserMasteryProgress[]>();
    for (const row of rows) {
      const mapped = this.mapMastery(row);
      const existing = map.get(row.userId) ?? [];
      existing.push(mapped);
      map.set(row.userId, existing);
    }
    return map;
  }

  // ══════════════════════════════════════════════════════════════════
  // ── Alerts (CRUD atómico) ─────────────────────────────────────────
  // ══════════════════════════════════════════════════════════════════

  async createAlert(alert: GamificationAlert): Promise<GamificationAlert> {
    const [row] = await db
      .insert(gamificationAlertsSchema)
      .values({
        id: alert.id,
        userId: alert.userId,
        alertType: alert.alertType,
        title: alert.title,
        message: alert.message,
        icon: alert.icon,
        data: alert.data,
        seen: false,
      })
      .returning();

    return this.mapAlert(row);
  }

  async getUserAlerts(userId: string, unseenOnly = true): Promise<GamificationAlert[]> {
    const conditions = [eq(gamificationAlertsSchema.userId, userId)];

    if (unseenOnly) {
      conditions.push(eq(gamificationAlertsSchema.seen, false));
    }

    const rows = await db
      .select()
      .from(gamificationAlertsSchema)
      .where(and(...conditions))
      .orderBy(desc(gamificationAlertsSchema.createdAt));

    return rows.map((r) => this.mapAlert(r));
  }

  async dismissAlert(alertId: string, userId: string): Promise<void> {
    await db
      .update(gamificationAlertsSchema)
      .set({ seen: true })
      .where(
        and(
          eq(gamificationAlertsSchema.id, alertId),
          eq(gamificationAlertsSchema.userId, userId),
        ),
      );
  }

  async dismissAllAlerts(userId: string): Promise<void> {
    await db
      .update(gamificationAlertsSchema)
      .set({ seen: true })
      .where(
        and(
          eq(gamificationAlertsSchema.userId, userId),
          eq(gamificationAlertsSchema.seen, false),
        ),
      );
  }

  // ══════════════════════════════════════════════════════════════════
  // ── Private Mappers ───────────────────────────────────────────────
  // ══════════════════════════════════════════════════════════════════

  private mapPointsLog(row: any): PointsLog {
    return {
      id: row.id,
      userId: row.userId,
      action: row.action,
      basePoints: row.basePoints,
      streakMultiplier: row.streakMultiplier,
      totalPoints: row.totalPoints,
      masteryCategory: row.masteryCategory,
      masteryXpGained: row.masteryXpGained,
      referenceId: row.referenceId,
      referenceType: row.referenceType,
      metadata: row.metadata,
      createdAt: row.createdAt,
    };
  }

  private mapStreak(row: any): UserStreak {
    return {
      id: row.id,
      userId: row.userId,
      streakType: row.streakType,
      currentCount: row.currentCount,
      longestCount: row.longestCount,
      lastActivityDate: row.lastActivityDate,
      isActive: row.isActive,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  private mapMilestone(row: any): Milestone {
    return {
      id: row.id,
      type: row.type,
      name: row.name,
      description: row.description,
      icon: row.icon,
      category: row.category,
      xpReward: row.xpReward,
      requiredValue: row.requiredValue,
      createdAt: row.createdAt,
    };
  }

  private mapUserMilestone(row: any): UserMilestone {
    return {
      id: row.id,
      userId: row.userId,
      milestoneId: row.milestoneId,
      unlockedAt: row.unlockedAt,
    };
  }

  private mapMastery(row: any): UserMasteryProgress {
    const category = row.category as MasteryCategory;
    const xp = row.currentXp;
    const levelConfig = getMasteryLevelForXp(category, xp);
    const nextLevel = getNextMasteryLevel(category, levelConfig.level as MasteryLevel);

    const nextLevelXp = nextLevel?.requiredXp ?? null;
    const progressPercent =
      nextLevelXp !== null
        ? Math.min(
            100,
            Math.round(
              ((xp - levelConfig.requiredXp) /
                (nextLevelXp - levelConfig.requiredXp)) *
                100,
            ),
          )
        : 100;

    return {
      id: row.id,
      userId: row.userId,
      category,
      currentXp: xp,
      currentLevel: levelConfig.level as MasteryLevel,
      levelName: levelConfig.name,
      levelIcon: levelConfig.icon,
      nextLevelXp,
      progressPercent,
      updatedAt: row.updatedAt,
    };
  }

  private mapWeeklyTitle(row: any): WeeklyChefTitle {
    return {
      id: row.id,
      userId: row.userId,
      title: row.title,
      weekStartDate: row.weekStartDate,
      weekEndDate: row.weekEndDate,
      rank: row.rank,
      xpEarned: row.xpEarned,
      createdAt: row.createdAt,
    };
  }

  private mapChallenge(row: any): Challenge {
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      icon: row.icon,
      type: row.type,
      action: row.action,
      targetValue: row.targetValue,
      xpReward: row.xpReward,
      startDate: row.startDate,
      endDate: row.endDate,
      isActive: row.isActive,
      createdAt: row.createdAt,
    };
  }

  private mapUserChallenge(row: any): UserChallenge {
    return {
      id: row.id,
      userId: row.userId,
      challengeId: row.challengeId,
      currentProgress: row.currentProgress,
      status: row.status,
      completedAt: row.completedAt,
      claimedAt: row.claimedAt,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  private mapAlert(row: any): GamificationAlert {
    return {
      id: row.id,
      userId: row.userId,
      alertType: row.alertType as GamificationAlertType,
      title: row.title,
      message: row.message,
      icon: row.icon,
      data: row.data,
      seen: row.seen,
      createdAt: row.createdAt,
    };
  }
}
