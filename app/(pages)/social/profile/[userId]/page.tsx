"use client";

import { useState, use, useMemo } from "react";
import dynamic from "next/dynamic";
import MaxWidthWrapper from "@/components/MaxWithWrapper";
import PostCard from "@/components/social/PostCard";
import UserCard from "@/components/social/UserCard";
import AchievementBadge from "@/components/social/AchievementBadge";
import MasteryCard from "@/components/social/MasteryCard";
import MilestoneGrid from "@/components/social/MilestoneGrid";
import StreakDisplay from "@/components/social/StreakDisplay";
import ChallengeCard from "@/components/social/ChallengeCard";
import ChefTitleSelector from "@/components/social/ChefTitleSelector";
import Loading from "@/components/Loading";
import {
  mockProfile,
  mockMyProfile,
  mockAchievements,
  mockUserAchievements,
  mockFeedPosts,
  mockFollowers,
  mockFollowing,
  mockGamificationProfile,
} from "@/lib/mock/socialData";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  ArrowLeft,
  ChefHat,
  Users,
  Flame,
  Trophy,
  BookOpen,
  ShoppingBasket,
  FileText,
  Settings,
  Zap,
  Calendar,
  Edit3,
  Star,
  Target,
  Swords,
  Award,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { UserLevel, SocialProfile as SocialProfileType } from "@/types/models/social";

/* bundle-dynamic-imports: LeagueBoard is heavy, only shown in "league" tab */
const LeagueBoard = dynamic(
  () => import("@/components/social/LeagueBoard"),
  { loading: () => <Loading /> }
);

/* rendering-hoist-jsx: Static config outside component */
const levelConfig: Record<UserLevel, { label: string; color: string; gradient: string }> = {
  novice: { label: "Novato", color: "text-gray-500", gradient: "from-gray-400 to-gray-600" },
  cook: { label: "Cocinero", color: "text-blue-500", gradient: "from-blue-400 to-blue-600" },
  chef: { label: "Chef", color: "text-purple-500", gradient: "from-purple-400 to-purple-600" },
  master_chef: { label: "Master Chef", color: "text-amber-500", gradient: "from-amber-400 to-amber-600" },
};

/* js-set-map-lookups: Pre-build Set for O(1) achievement lookup */
const unlockedAchievementIds = new Set(mockUserAchievements.map((ua) => ua.achievementId));
const lockedAchievements = mockAchievements.filter((a) => !unlockedAchievementIds.has(a.id));

type ProfileTab = "overview" | "posts" | "achievements" | "masteries" | "league" | "followers" | "following";

export default function SocialProfilePage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = use(params);
  const [activeTab, setActiveTab] = useState<ProfileTab>("overview");
  const [isFollowing, setIsFollowing] = useState(false);
  const [showBioEditor, setShowBioEditor] = useState(false);
  const [bioText, setBioText] = useState("");
  const [selectedTitleId, setSelectedTitleId] = useState<string | null>(
    mockGamificationProfile.selectedTitleId
  );

  const isOwnProfile = userId === "current-user" || userId === mockMyProfile.user.id;
  const profile: SocialProfileType = isOwnProfile ? mockMyProfile : mockProfile;
  const level = levelConfig[profile.stats.level];
  const gamification = mockGamificationProfile;

  const xpForNextLevel = Math.ceil(profile.stats.xp / 1000) * 1000;
  const xpProgress = (profile.stats.xp / xpForNextLevel) * 100;

  const userPosts = isOwnProfile
    ? mockFeedPosts.slice(0, 3)
    : mockFeedPosts.filter((p) => p.userId === profile.user.id);

  const selectedTitle = gamification.chefTitles.find((t) => t.id === selectedTitleId);

  /* rerender-memo: Tabs config recreated only when profile stats change */
  const tabs = useMemo<{ id: ProfileTab; label: string; icon: React.ReactNode; count?: number }[]>(() => [
    { id: "overview", label: "General", icon: <Sparkles className="w-3.5 h-3.5" aria-hidden="true" /> },
    { id: "posts", label: "Posts", icon: <FileText className="w-3.5 h-3.5" aria-hidden="true" />, count: profile.stats.postsCount },
    { id: "achievements", label: "Logros", icon: <Trophy className="w-3.5 h-3.5" aria-hidden="true" /> },
    { id: "masteries", label: "Maestrías", icon: <Star className="w-3.5 h-3.5" aria-hidden="true" /> },
    { id: "league", label: "Liga", icon: <Swords className="w-3.5 h-3.5" aria-hidden="true" /> },
    { id: "followers", label: "Seguidores", icon: <Users className="w-3.5 h-3.5" aria-hidden="true" />, count: profile.stats.followersCount },
    { id: "following", label: "Siguiendo", icon: <Users className="w-3.5 h-3.5" aria-hidden="true" />, count: profile.stats.followingCount },
  ], [profile.stats.postsCount, profile.stats.followersCount, profile.stats.followingCount]);

  return (
    <MaxWidthWrapper maxWidth="max-w-5xl" className="py-6">
      {/* Back nav */}
      <Link href="/social" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
        <ArrowLeft className="w-4 h-4" aria-hidden="true" />
        Volver a comunidad
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
        {/* ─── Main Column ─── */}
        <div className="space-y-6">
          {/* Profile Header Card */}
          <Card className="border-border/50 overflow-hidden">
            {/* Banner */}
            <div className={cn("h-28 bg-linear-to-r", level.gradient, "opacity-20")} />

            <CardContent className="p-6 -mt-14">
              <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
                {/* Avatar */}
                <div className="relative shrink-0">
                  <Avatar className="w-24 h-24 ring-4 ring-background shadow-lg">
                    <AvatarImage src={profile.user.avatarUrl ?? undefined} alt={profile.user.fullName} />
                    <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
                      {profile.user.fullName.split(" ").map((n) => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className={cn(
                    "absolute -bottom-1 left-1/2 -translate-x-1/2 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-linear-to-r shadow-lg whitespace-nowrap",
                    level.gradient
                  )}>
                    {level.label}
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-xl font-bold text-foreground text-balance">{profile.user.fullName}</h1>
                    {isOwnProfile ? (
                      <ChefTitleSelector
                        titles={gamification.chefTitles}
                        selectedTitleId={selectedTitleId}
                        onSelect={setSelectedTitleId}
                        editable
                      />
                    ) : (
                      selectedTitle && (
                        <ChefTitleSelector
                          titles={gamification.chefTitles}
                          selectedTitleId={selectedTitleId}
                          onSelect={() => {}}
                        />
                      )
                    )}
                  </div>
                  {profile.user.bio && (
                    <p className="text-sm text-muted-foreground leading-relaxed">{profile.user.bio}</p>
                  )}
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="w-3 h-3" aria-hidden="true" />
                    Miembro desde {new Intl.DateTimeFormat("es", { month: "long", year: "numeric" }).format(new Date(profile.user.registeredAt))}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  {isOwnProfile ? (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5 rounded-full"
                        onClick={() => {
                          setBioText(profile.user.bio || "");
                          setShowBioEditor(true);
                        }}
                      >
                        <Edit3 className="w-3.5 h-3.5" aria-hidden="true" />
                        Editar perfil
                      </Button>
                      <Link href="/settings">
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" aria-label="Ajustes">
                          <Settings className="w-4 h-4" aria-hidden="true" />
                        </Button>
                      </Link>
                    </>
                  ) : (
                    <Button
                      variant={isFollowing ? "outline" : "default"}
                      size="sm"
                      className={cn(
                        "gap-1.5 rounded-full px-6",
                        isFollowing
                          ? "border-border hover:border-destructive hover:text-destructive"
                          : "bg-primary text-primary-foreground hover:bg-primary/90"
                      )}
                      onClick={() => setIsFollowing(!isFollowing)}
                    >
                      <Users className="w-4 h-4" />
                      {isFollowing ? "Siguiendo" : "Seguir"}
                    </Button>
                  )}
                </div>
              </div>

              {/* XP + Stats — tabular-nums for aligned numbers */}
              <div className="mt-5 grid grid-cols-2 sm:grid-cols-6 gap-3" style={{ fontVariantNumeric: "tabular-nums" }}>
                {/* XP Bar spanning 2 cols */}
                <div className="col-span-2 space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Zap className="w-3 h-3 text-primary" aria-hidden="true" />
                      {profile.stats.xp.toLocaleString()} XP
                    </span>
                    <span className="text-muted-foreground">{xpForNextLevel.toLocaleString()} XP</span>
                  </div>
                  <Progress value={xpProgress} className="h-2" />
                </div>

                {/* Stats */}
                {[
                  { label: "Cocinadas", value: profile.stats.recipesCooked, icon: <ChefHat className="w-3.5 h-3.5 text-orange-500" aria-hidden="true" /> },
                  { label: "Creadas", value: profile.stats.recipesCreated, icon: <BookOpen className="w-3.5 h-3.5 text-blue-500" aria-hidden="true" /> },
                  { label: "Racha", value: `${profile.stats.currentStreak}d`, icon: <Flame className="w-3.5 h-3.5 text-red-500" aria-hidden="true" /> },
                  { label: "Despensa", value: profile.stats.pantryItemsCount, icon: <ShoppingBasket className="w-3.5 h-3.5 text-green-500" aria-hidden="true" /> },
                ].map((stat) => (
                  <div key={stat.label} className="flex items-center gap-1.5 bg-muted/50 rounded-lg px-2.5 py-2">
                    {stat.icon}
                    <div>
                      <p className="text-sm font-bold text-foreground leading-none">{stat.value}</p>
                      <p className="text-[10px] text-muted-foreground">{stat.label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Tabs */}
          <div className="flex border-b border-border/40 overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-all whitespace-nowrap",
                  activeTab === tab.id
                    ? "text-primary border-primary"
                    : "text-muted-foreground border-transparent hover:text-foreground"
                )}
              >
                {tab.icon}
                {tab.label}
                {tab.count !== undefined && (
                  <span className={cn(
                    "text-[10px] px-1.5 py-0.5 rounded-full",
                    activeTab === tab.id
                      ? "bg-primary/10 text-primary"
                      : "bg-muted text-muted-foreground"
                  )}>
                    {tab.count > 999 ? `${(tab.count / 1000).toFixed(1)}k` : tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Tab Content — rendering-conditional-render: ternary chain */}
          <div className="min-h-[300px]">
            {activeTab === "overview" ? (
              <div className="space-y-6">
                {/* Streaks */}
                <section>
                  <h3 className="text-base font-bold text-foreground flex items-center gap-2 mb-3">
                    <Flame className="w-4 h-4 text-orange-500" aria-hidden="true" />
                    Rachas
                  </h3>
                  <StreakDisplay streaks={gamification.streaks} />
                </section>

                {/* Masteries Overview */}
                <section>
                  <h3 className="text-base font-bold text-foreground flex items-center gap-2 mb-3">
                    <Star className="w-4 h-4 text-primary" aria-hidden="true" />
                    Maestrías
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {gamification.masteries.map((mastery) => (
                      <MasteryCard key={mastery.id} mastery={mastery} />
                    ))}
                  </div>
                </section>

                {/* Active Challenges */}
                {gamification.activeChallenges.length > 0 ? (
                  <section>
                    <h3 className="text-base font-bold text-foreground flex items-center gap-2 mb-3">
                      <Target className="w-4 h-4 text-primary" aria-hidden="true" />
                      Retos Activos
                    </h3>
                    <div className="space-y-3">
                      {gamification.activeChallenges.map((ch) => (
                        <ChallengeCard key={ch.id} challenge={ch} />
                      ))}
                    </div>
                  </section>
                ) : null}

                {/* Chef Titles Gallery */}
                {gamification.chefTitles.length > 0 ? (
                  <section>
                    <h3 className="text-base font-bold text-foreground flex items-center gap-2 mb-3">
                      <Award className="w-4 h-4 text-amber-500" aria-hidden="true" />
                      Títulos de Chef
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {gamification.chefTitles.map((title) => (
                        <div
                          key={title.id}
                          className={cn(
                            "flex items-center gap-1.5 px-3 py-2 rounded-xl border text-sm",
                            title.id === selectedTitleId
                              ? "ring-2 ring-primary border-primary bg-primary/5"
                              : "border-border/50 bg-muted/30"
                          )}
                        >
                          <span className="text-lg" aria-hidden="true">{title.icon}</span>
                          <div>
                            <p className="text-xs font-semibold text-foreground">{title.name}</p>
                            <p className="text-[10px] text-muted-foreground">{title.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                ) : null}

                {/* Recent Posts */}
                {userPosts.length > 0 ? (
                  <section>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                        <FileText className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
                        Últimas publicaciones
                      </h3>
                      <button
                        onClick={() => setActiveTab("posts")}
                        className="text-xs text-primary hover:underline"
                      >
                        Ver todas
                      </button>
                    </div>
                    <div className="space-y-3">
                      {userPosts.slice(0, 2).map((post) => (
                        <PostCard key={post.id} post={post} />
                      ))}
                    </div>
                  </section>
                ) : null}
              </div>
            ) : activeTab === "posts" ? (
              <div className="space-y-4">
                {userPosts.length > 0 ? (
                  userPosts.map((post) => <PostCard key={post.id} post={post} />)
                ) : (
                  <EmptyState
                    icon={<FileText className="w-8 h-8" />}
                    title="Sin publicaciones"
                    description={isOwnProfile ? "¡Comparte tu primera creación!" : "Este usuario no ha publicado nada aún"}
                  />
                )}
              </div>
            ) : activeTab === "achievements" ? (
              <div className="space-y-6">
                {/* Milestones */}
                <section>
                  <h3 className="text-base font-bold text-foreground flex items-center gap-2 mb-3">
                    <Award className="w-4 h-4 text-amber-500" aria-hidden="true" />
                    Hitos
                  </h3>
                  <MilestoneGrid milestones={gamification.milestones} />
                </section>

                <Separator />

                {/* Achievements — js-set-map-lookups: O(1) via pre-built Set */}
                <section>
                  <h3 className="text-base font-bold text-foreground flex items-center gap-2 mb-3">
                    <Trophy className="w-4 h-4 text-amber-500" aria-hidden="true" />
                    Logros ({mockUserAchievements.length})
                  </h3>
                  <div className="flex flex-wrap gap-4">
                    {mockUserAchievements.map((ua) => (
                      <AchievementBadge
                        key={ua.id}
                        achievement={ua.achievement}
                        unlocked={ua}
                        size="md"
                      />
                    ))}
                  </div>
                  <Separator className="my-4" />
                  <h4 className="text-sm font-semibold text-muted-foreground mb-3">Por desbloquear</h4>
                  <div className="flex flex-wrap gap-4">
                    {lockedAchievements.map((ach) => (
                      <AchievementBadge key={ach.id} achievement={ach} size="md" />
                    ))}
                  </div>
                </section>
              </div>
            ) : activeTab === "masteries" ? (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Las maestrías evolucionan según tu actividad. Cada nivel desbloquea un nuevo icono y recompensas.
                </p>
                {gamification.masteries.map((mastery) => (
                  <MasteryCard key={mastery.id} mastery={mastery} />
                ))}
              </div>
            ) : activeTab === "league" ? (
              <div className="space-y-4">
                {gamification.league ? (
                  <LeagueBoard league={gamification.league} />
                ) : (
                  <EmptyState
                    icon={<Swords className="w-8 h-8" />}
                    title="Sin liga activa"
                    description="Participa durante la semana para unirte a una liga"
                  />
                )}
              </div>
            ) : activeTab === "followers" ? (
              <div className="space-y-1">
                {mockFollowers.length > 0 ? (
                  mockFollowers.map((user) => (
                    <UserCard
                      key={user.userId}
                      userId={user.userId}
                      fullName={user.fullName}
                      avatarUrl={user.avatarUrl}
                      showFollowButton={!isOwnProfile}
                    />
                  ))
                ) : (
                  <EmptyState
                    icon={<Users className="w-8 h-8" />}
                    title="Sin seguidores"
                    description="Aún no tienes seguidores"
                  />
                )}
              </div>
            ) : activeTab === "following" ? (
              <div className="space-y-1">
                {mockFollowing.length > 0 ? (
                  mockFollowing.map((user) => (
                    <UserCard
                      key={user.userId}
                      userId={user.userId}
                      fullName={user.fullName}
                      avatarUrl={user.avatarUrl}
                      showFollowButton
                      isFollowing
                    />
                  ))
                ) : (
                  <EmptyState
                    icon={<Users className="w-8 h-8" />}
                    title="Sin seguidos"
                    description="¡Explora y sigue a otros chefs!"
                  />
                )}
              </div>
            ) : null}
          </div>
        </div>

        {/* ─── Right Sidebar ─── */}
        <aside className="hidden lg:block space-y-5">
          {/* Masteries Compact */}
          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-1.5">
                <Star className="w-4 h-4 text-primary" aria-hidden="true" />
                Maestrías
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {gamification.masteries.map((mastery) => (
                <MasteryCard key={mastery.id} mastery={mastery} compact />
              ))}
            </CardContent>
          </Card>

          {/* Streaks Summary */}
          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-orange-500" />
                Rachas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {gamification.streaks.map((streak) => (
                <div key={streak.type} className="flex items-center gap-2">
                  <span className="text-lg" aria-hidden="true">{streak.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground truncate">{streak.label}</p>
                  </div>
                  <div className="flex items-center gap-0.5 text-orange-500" style={{ fontVariantNumeric: "tabular-nums" }}>
                    <Flame className="w-3 h-3" aria-hidden="true" />
                    <span className="text-sm font-bold">{streak.currentStreak}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Titles — rendering-conditional-render */}
          {gamification.chefTitles.length > 0 ? (
            <Card className="border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-amber-500" aria-hidden="true" />
                  Títulos ({gamification.chefTitles.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {gamification.chefTitles.map((title) => (
                  <div
                    key={title.id}
                    className={cn(
                      "flex items-center gap-2 text-xs",
                      title.id === selectedTitleId && "font-semibold text-primary"
                    )}
                  >
                    <span className="text-base" aria-hidden="true">{title.icon}</span>
                    <span className="flex-1 truncate">{title.name}</span>
                    {title.id === selectedTitleId ? (
                      <span className="text-[10px] text-primary">activo</span>
                    ) : null}
                  </div>
                ))}
              </CardContent>
            </Card>
          ) : null}

          {/* League position — rendering-conditional-render */}
          {gamification.league ? (
            <Card className="border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-1.5">
                  <Swords className="w-4 h-4 text-primary" aria-hidden="true" />
                  Liga
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-1" style={{ fontVariantNumeric: "tabular-nums" }}>
                  <span className="text-3xl" aria-hidden="true">🥇</span>
                  <p className="text-sm font-bold text-foreground">{gamification.league.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Posición #{gamification.league.currentUserPosition}
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : null}
        </aside>
      </div>

      {/* Edit Bio Sheet — overscroll-behavior: contain for touch */}
      <Sheet open={showBioEditor} onOpenChange={setShowBioEditor}>
        <SheetContent side="bottom" className="h-auto rounded-t-2xl" style={{ overscrollBehavior: "contain" }}>
          <SheetHeader>
            <SheetTitle>Editar biografía</SheetTitle>
          </SheetHeader>
          <div className="space-y-4 pt-4">
            <textarea
              value={bioText}
              onChange={(e) => setBioText(e.target.value)}
              placeholder="Cuéntanos sobre ti…"
              aria-label="Biografía"
              className="w-full bg-secondary/60 rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 min-h-[100px] resize-none"
              maxLength={200}
            />
            <div className="flex items-center justify-between" style={{ fontVariantNumeric: "tabular-nums" }}>
              <span className="text-xs text-muted-foreground">{bioText.length}/200</span>
              <Button
                size="sm"
                className="rounded-full px-6"
                onClick={() => {
                  console.log("Update bio:", bioText);
                  setShowBioEditor(false);
                }}
              >
                Guardar
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </MaxWidthWrapper>
  );
}

function EmptyState({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mb-3 text-muted-foreground" aria-hidden="true">
        {icon}
      </div>
      <p className="text-sm font-medium text-foreground">{title}</p>
      <p className="text-xs text-muted-foreground mt-1">{description}</p>
    </div>
  );
}
