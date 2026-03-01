"use client";

import { useState } from "react";
import Link from "next/link";
import PostCard from "@/components/social/PostCard";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  ChefHat,
  Users,
  CalendarCheck,
  Brain,
  Trophy,
  Star,
  Heart,
  Flame,
  Medal,
  Crown,
  Gem,
  Sparkles,
  Shield,
  Zap,
  Target,
  Clock,
  TrendingUp,
  MessageCircle,
  Swords,
} from "lucide-react";
import { cn } from "@/lib/utils";

import { useGetProfile } from "@/hooks/social/useSocialProfile";
import { useFollowUser, useUnfollowUser } from "@/hooks/social/useSocialFollows";
import { useToggleLikePost } from "@/hooks/social/useSocialPosts";
import {
  useGamificationUserProfile,
  useGamificationProfile,
  useLeaderboard,
} from "@/hooks/gamification/useGamification";
import type { UserMasteryProgress, WeeklyRanking } from "@/types/models/gamification";

// ─── Props ────────────────────────────────────────────────────────────────────

interface ProfileClientProps {
  userId: string;
  currentUserId: string;
}

// ─── Hoisted constants ────────────────────────────────────────────────────────

type MasteryCat = "social" | "chef" | "organizador" | "smart";

const MASTERY_LEVEL_LABELS = ["I", "II", "III", "IV", "V"] as const;

const MASTERY_ICONS: Record<MasteryCat, Record<number, React.ReactNode>> = {
  social: {
    1: <Users className="h-6 w-6" />,
    2: <Users className="h-6 w-6" />,
    3: <MessageCircle className="h-6 w-6" />,
    4: <Heart className="h-6 w-6" />,
    5: <Sparkles className="h-6 w-6" />,
  },
  chef: {
    1: <ChefHat className="h-6 w-6" />,
    2: <ChefHat className="h-6 w-6" />,
    3: <Flame className="h-6 w-6" />,
    4: <Crown className="h-6 w-6" />,
    5: <Gem className="h-6 w-6" />,
  },
  organizador: {
    1: <CalendarCheck className="h-6 w-6" />,
    2: <CalendarCheck className="h-6 w-6" />,
    3: <Target className="h-6 w-6" />,
    4: <Shield className="h-6 w-6" />,
    5: <Star className="h-6 w-6" />,
  },
  smart: {
    1: <Brain className="h-6 w-6" />,
    2: <Brain className="h-6 w-6" />,
    3: <Zap className="h-6 w-6" />,
    4: <TrendingUp className="h-6 w-6" />,
    5: <Sparkles className="h-6 w-6" />,
  },
};

const MASTERY_BG: Record<MasteryCat, string> = {
  social: "from-purple-500/20 to-purple-600/10 border-purple-500/30",
  chef: "from-primary/20 to-primary/10 border-primary/30",
  organizador: "from-green-500/20 to-green-600/10 border-green-500/30",
  smart: "from-blue-500/20 to-blue-600/10 border-blue-500/30",
};

const MASTERY_TEXT: Record<MasteryCat, string> = {
  social: "text-purple-500",
  chef: "text-primary",
  organizador: "text-green-500",
  smart: "text-blue-500",
};

const MASTERY_BAR: Record<MasteryCat, string> = {
  social: "bg-purple-500",
  chef: "bg-primary",
  organizador: "bg-green-500",
  smart: "bg-blue-500",
};

const CATEGORY_COLORS: Record<string, string> = {
  cooking: "bg-primary/10 text-primary",
  social: "bg-purple-500/10 text-purple-500",
  pantry: "bg-green-500/10 text-green-500",
  planning: "bg-blue-500/10 text-blue-500",
  general: "bg-amber-500/10 text-amber-500",
};

const rtf = new Intl.DateTimeFormat("es", { month: "long", year: "numeric" });

function getRankIcon(position: number) {
  if (position === 1) return <Crown className="h-5 w-5 text-yellow-500" />;
  if (position === 2) return <Medal className="h-5 w-5 text-gray-400" />;
  if (position === 3) return <Medal className="h-5 w-5 text-amber-700" />;
  return <span className="text-sm font-bold text-muted-foreground">#{position}</span>;
}

// ─── ProfileMasteryCard ───────────────────────────────────────────────────────

function ProfileMasteryCard({ mastery }: { mastery: UserMasteryProgress }) {
  const cat = mastery.category as MasteryCat;
  const icon =
    MASTERY_ICONS[cat]?.[mastery.currentLevel] ?? <Star className="h-6 w-6" />;

  return (
    <Card className={cn("border bg-linear-to-br overflow-hidden", MASTERY_BG[cat])}>
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <div className="relative">
            <div
              className={cn(
                "w-16 h-16 rounded-2xl flex items-center justify-center bg-background/80 shadow-sm border",
                MASTERY_TEXT[cat]
              )}
            >
              {icon}
            </div>
            <div
              className={cn(
                "absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-md",
                MASTERY_BAR[cat]
              )}
            >
              {MASTERY_LEVEL_LABELS[mastery.currentLevel - 1]}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-semibold text-foreground capitalize">{mastery.levelName}</h3>
              <span className={cn("text-xs font-bold", MASTERY_TEXT[cat])}>
                Nivel {MASTERY_LEVEL_LABELS[mastery.currentLevel - 1]}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mb-3 line-clamp-1 capitalize">
              {mastery.category}
            </p>

            {/* Progress bar */}
            <div className="space-y-1.5">
              <div className="w-full h-2 rounded-full bg-background/60 overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full motion-safe:transition-all duration-500",
                    MASTERY_BAR[cat]
                  )}
                  style={{ width: `${mastery.progressPercent}%` }}
                />
              </div>
              <div
                className="flex justify-between text-[10px] text-muted-foreground"
                style={{ fontVariantNumeric: "tabular-nums" }}
              >
                <span>{mastery.currentXp} pts</span>
                <span>{mastery.nextLevelXp ?? "MAX"} pts</span>
              </div>
            </div>

            {/* Level dots */}
            <div className="flex items-center gap-1.5 mt-3">
              {[1, 2, 3, 4, 5].map((lvl) => (
                <div
                  key={lvl}
                  className={cn(
                    "w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold motion-safe:transition-all",
                    lvl <= mastery.currentLevel
                      ? cn(MASTERY_BAR[cat], "text-white shadow-sm")
                      : lvl === mastery.currentLevel + 1
                        ? "border-2 border-muted-foreground/30 text-muted-foreground"
                        : "bg-muted/50 text-muted-foreground/50"
                  )}
                >
                  {MASTERY_LEVEL_LABELS[lvl - 1]}
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Main Client Component ────────────────────────────────────────────────────

export default function ProfileClient({ userId, currentUserId }: ProfileClientProps) {
  const isOwnProfile = userId === currentUserId;
  const [followOverride, setFollowOverride] = useState<boolean | null>(null);

  // ─── Queries (SSR-hydrated) ──────────────────────────────────────────
  const { data: profile } = useGetProfile(userId);

  // Derive follow state: use local override if set, otherwise server state
  const isFollowing = followOverride ?? profile?.isFollowedByCurrentUser ?? false;

  // ─── Gamification (SSR-hydrated for the target user) ────────────────
  // Both hooks always called to satisfy rules of hooks; one is disabled
  const { data: ownGamification } = useGamificationProfile(!isOwnProfile ? false : true);
  const { data: otherGamification } = useGamificationUserProfile(userId, isOwnProfile ? false : true);
  const gamificationProfile = isOwnProfile ? ownGamification : otherGamification;
  const { data: leaderboard = [] } = useLeaderboard({ period: "week" });

  // ─── Mutations ──────────────────────────────────────────────────────────
  const followUser = useFollowUser();
  const unfollowUser = useUnfollowUser();
  const toggleLikePost = useToggleLikePost();

  // ─── Derived data ───────────────────────────────────────────────────────
  const masteries = gamificationProfile?.masteries ?? [];
  const milestones = gamificationProfile?.recentMilestones ?? [];
  const weeklyRank = gamificationProfile?.weeklyRank;
  const weeklyTitle = gamificationProfile?.weeklyTitle;

  // ─── Handlers ───────────────────────────────────────────────────────────
  const handleToggleFollow = () => {
    if (isFollowing) {
      unfollowUser.mutate(userId);
      setFollowOverride(false);
    } else {
      followUser.mutate(userId);
      setFollowOverride(true);
    }
  };

  const handleLikePost = (postId: string, isLiked: boolean) => {
    toggleLikePost.mutate({ postId, isLiked });
  };

  if (!profile) {
    return (
      <main className="container py-6 max-w-2xl mx-auto">
        <div className="flex items-center justify-center py-20">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </main>
    );
  }

  return (
    <main className="container py-6 max-w-2xl mx-auto space-y-6">
      {/* Back button */}
      <Link href="/social">
        <Button variant="ghost" size="sm" className="gap-2">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Volver
        </Button>
      </Link>

      {/* ─── Profile Header ─── */}
      <Card className="overflow-hidden">
        <div className="h-28 bg-linear-to-r from-primary/30 via-primary/20 to-primary/10 relative">
          <div className="absolute -bottom-12 left-6">
            <Avatar className="h-24 w-24 ring-4 ring-card shadow-lg">
              <AvatarImage
                src={profile.user.avatarUrl ?? undefined}
                alt={profile.user.fullName}
              />
              <AvatarFallback className="text-2xl bg-primary/10 text-primary font-bold">
                {profile.user.fullName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>

        <CardContent className="pt-14 pb-5 px-6">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h1 className="text-xl font-bold text-foreground text-balance">
                {profile.user.fullName}
              </h1>
              <p className="text-sm text-muted-foreground">
                @{profile.user.fullName.toLowerCase().replace(/\s+/g, "_")}
              </p>
            </div>
            {!isOwnProfile ? (
              <Button
                variant={isFollowing ? "outline" : "default"}
                size="sm"
                onClick={handleToggleFollow}
                className="rounded-full"
                disabled={followUser.isPending || unfollowUser.isPending}
              >
                {isFollowing ? "Siguiendo" : "Seguir"}
              </Button>
            ) : null}
          </div>

          {profile.user.bio ? (
            <p className="text-sm text-foreground/80 mb-4">{profile.user.bio}</p>
          ) : null}

          <div
            className="flex items-center gap-6 text-sm"
            style={{ fontVariantNumeric: "tabular-nums" }}
          >
            <div className="text-center">
              <p className="font-bold text-foreground">{profile.stats.recipesCreated}</p>
              <p className="text-xs text-muted-foreground">Recetas</p>
            </div>
            <div className="text-center">
              <p className="font-bold text-foreground">
                {profile.stats.followersCount.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">Seguidores</p>
            </div>
            <div className="text-center">
              <p className="font-bold text-foreground">{profile.stats.followingCount}</p>
              <p className="text-xs text-muted-foreground">Siguiendo</p>
            </div>
            <div className="flex items-center gap-1 ml-auto text-xs text-muted-foreground">
              <Clock className="h-3 w-3" aria-hidden="true" />
              Desde {rtf.format(new Date(profile.user.registeredAt))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ─── Weekly Rank Badge ─── */}
      {weeklyRank && weeklyTitle ? (
        <Card className="p-4 bg-linear-to-r from-yellow-500/10 via-primary/10 to-orange-500/10 border-primary/20">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-background/80 flex items-center justify-center border border-primary/20">
              {getRankIcon(weeklyRank)}
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">Liga Semanal</p>
              <p className="font-bold text-foreground">Puesto #{weeklyRank}</p>
            </div>
            <div className="text-right" style={{ fontVariantNumeric: "tabular-nums" }}>
              <p className="font-bold text-primary">
                {gamificationProfile?.pointsThisWeek ?? 0} pts
              </p>
              <p className="text-xs text-muted-foreground capitalize">
                {weeklyTitle.title.replace(/_/g, " ")}
              </p>
            </div>
          </div>
        </Card>
      ) : null}

      {/* ─── Tabs ─── */}
      <Tabs defaultValue="posts" className="w-full">
        <TabsList className="w-full bg-card border border-border/50">
          <TabsTrigger value="posts" className="flex-1 gap-1.5">
            <MessageCircle className="h-4 w-4" aria-hidden="true" />
            Posts
          </TabsTrigger>
          <TabsTrigger value="masteries" className="flex-1 gap-1.5">
            <Trophy className="h-4 w-4" aria-hidden="true" />
            Maestrías
          </TabsTrigger>
          <TabsTrigger value="milestones" className="flex-1 gap-1.5">
            <Medal className="h-4 w-4" aria-hidden="true" />
            Hitos
          </TabsTrigger>
          <TabsTrigger value="league" className="flex-1 gap-1.5">
            <Swords className="h-4 w-4" aria-hidden="true" />
            Liga
          </TabsTrigger>
        </TabsList>

        {/* ── Posts Tab ── */}
        <TabsContent value="posts" className="mt-4 space-y-4">
          {profile.recentActivity && profile.recentActivity.length > 0 ? (
            profile.recentActivity.map((post) => (
              <PostCard key={post.id} post={post} onLike={handleLikePost} />
            ))
          ) : (
            <EmptyState
              icon={<MessageCircle className="w-8 h-8" />}
              title="Sin publicaciones"
              description={
                isOwnProfile
                  ? "¡Comparte tu primera creación!"
                  : "Este usuario no ha publicado nada aún"
              }
            />
          )}
        </TabsContent>

        {/* ── Masteries Tab ── */}
        <TabsContent value="masteries" className="mt-4 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="h-5 w-5 text-primary" aria-hidden="true" />
            <h2 className="font-semibold text-foreground">Maestrías</h2>
          </div>
          <p className="text-sm text-muted-foreground -mt-2 mb-4">
            Gana puntos y sube de nivel en cada área. Los iconos evolucionan al avanzar.
          </p>
          {masteries.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {masteries.map((m) => (
                <ProfileMasteryCard key={m.id} mastery={m} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<Trophy className="w-8 h-8" />}
              title="Sin maestrías"
              description="Comienza a cocinar y participar para desbloquear maestrías"
            />
          )}
        </TabsContent>

        {/* ── Milestones Tab ── */}
        <TabsContent value="milestones" className="mt-4 space-y-6">
          {milestones.length > 0 ? (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Star className="h-5 w-5 text-primary" aria-hidden="true" />
                <h2 className="font-semibold text-foreground">
                  Hitos recientes ({milestones.length})
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {milestones.map((m) => (
                  <Card key={m.id} className="border-border/50">
                    <CardContent className="p-4 flex items-center gap-3">
                      <div
                        className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center",
                          CATEGORY_COLORS[m.milestone?.category ?? "general"] ??
                            "bg-muted text-muted-foreground"
                        )}
                      >
                        <Star className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-foreground">
                          {m.milestone?.name ?? "Hito"}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {m.milestone?.description ?? ""}
                        </p>
                      </div>
                      <Badge variant="secondary" className="text-[10px] shrink-0">
                        ✓
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <EmptyState
              icon={<Medal className="w-8 h-8" />}
              title="Sin hitos"
              description="Completa acciones para desbloquear hitos"
            />
          )}
        </TabsContent>

        {/* ── League Tab ── */}
        <TabsContent value="league" className="mt-4 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Swords className="h-5 w-5 text-primary" aria-hidden="true" />
            <h2 className="font-semibold text-foreground">Liga Semanal</h2>
          </div>
          <p className="text-sm text-muted-foreground -mt-2 mb-4">
            Compite cada semana por el primer puesto. Los puntos se reinician los lunes.
          </p>

          {leaderboard.length > 0 ? (
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                {leaderboard.map((entry: WeeklyRanking) => {
                  const isCurrentUser = entry.userId === currentUserId;
                  return (
                    <div
                      key={entry.userId}
                      className={cn(
                        "flex items-center gap-3 p-4 border-b border-border/30 last:border-0 motion-safe:transition-colors",
                        isCurrentUser
                          ? "bg-primary/5 border-l-2 border-l-primary"
                          : "hover:bg-secondary/30"
                      )}
                    >
                      <div className="w-8 flex items-center justify-center shrink-0">
                        {getRankIcon(entry.rank)}
                      </div>
                      <Avatar className="h-10 w-10 shrink-0">
                        <AvatarImage
                          src={entry.avatarUrl ?? undefined}
                          alt={entry.fullName}
                        />
                        <AvatarFallback>{entry.fullName[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p
                          className={cn(
                            "font-medium text-sm truncate",
                            isCurrentUser ? "text-primary" : "text-foreground"
                          )}
                        >
                          {entry.fullName} {isCurrentUser ? "(Tú)" : ""}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          @{entry.fullName.toLowerCase().replace(/\s+/g, "_")}
                        </p>
                      </div>
                      <div
                        className="text-right shrink-0"
                        style={{ fontVariantNumeric: "tabular-nums" }}
                      >
                        <p className="font-bold text-sm text-foreground">
                          {entry.weeklyXp} pts
                        </p>
                        {entry.currentTitle ? (
                          <p className="text-[10px] text-muted-foreground capitalize">
                            {entry.currentTitle.replace(/_/g, " ")}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          ) : (
            <EmptyState
              icon={<Swords className="w-8 h-8" />}
              title="Sin liga activa"
              description="Participa durante la semana para unirte a una liga"
            />
          )}
        </TabsContent>
      </Tabs>
    </main>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div
        className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mb-3 text-muted-foreground"
        aria-hidden="true"
      >
        {icon}
      </div>
      <p className="text-sm font-medium text-foreground">{title}</p>
      <p className="text-xs text-muted-foreground mt-1">{description}</p>
    </div>
  );
}
