"use client";

import { useState } from "react";
import MaxWidthWrapper from "@/components/MaxWithWrapper";
import PostCard from "@/components/social/PostCard";
import CommentSection from "@/components/social/CommentSection";
import InsightCard from "@/components/social/InsightCard";
import {
  mockMyProfile,
  mockFeedPosts,
  mockComments,
  mockInsights,
  mockChallenges,
  mockExploreData,
  mockStreaks,
  mockFollowers,
} from "@/lib/mock/socialData";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  Image as ImageIcon,
  Video,
  ChefHat,
  TrendingUp,
  Users,
  Clock,
  Plus,
  Send,
  Flame,
  Award,
  Camera,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { SocialPost } from "@/types/models/social";

/* ─── Hoisted static data derived from mocks ─── */

const LEVEL_LABELS: Record<string, string> = {
  novice: "Novato",
  cook: "Cocinero",
  chef: "Chef",
  master_chef: "Master Chef",
};

const STORIES = [
  {
    id: "own",
    user: "Tu historia",
    avatar: mockMyProfile.user.avatarUrl,
    isOwn: true,
    hasNew: false,
  },
  ...mockFollowers.slice(0, 5).map((f, i) => ({
    id: f.userId,
    user: f.fullName.split(" ")[0],
    avatar: f.avatarUrl,
    isOwn: false,
    hasNew: i < 3,
  })),
];

const ACTION_MAP: Record<string, string> = {
  recipe_cooked: "está cocinando",
  recipe_created: "creó",
  recipe_saved: "guardó",
  pantry_updated: "actualizó despensa",
  pantry_item_added: "actualizó despensa",
  tip_added: "compartió un tip en",
  achievement_unlocked: "desbloqueó logro",
  streak_milestone: "alcanzó racha",
};

const rtf = new Intl.RelativeTimeFormat("es", { numeric: "auto" });

const LIVE_ACTIVITIES = mockFeedPosts
  .filter((p) => p.postType === "activity" && p.activityType)
  .slice(0, 4)
  .map((p) => ({
    id: p.id,
    user: { name: p.author.fullName.split(" ")[0], avatar: p.author.avatarUrl },
    action: ACTION_MAP[p.activityType!] || "interactuó",
    recipe: p.recipe?.name ?? (p.metadata as Record<string, string>)?.achievementName ?? "",
    time: rtf.format(
      Math.round((new Date(p.createdAt).getTime() - Date.now()) / 3600000),
      "hour"
    ),
    image: p.image || p.recipe?.image || null,
  }));

function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}

/* ─── Main Page Component ─── */

export default function SocialPage() {
  const [newPost, setNewPost] = useState("");
  const [commentSheetPost, setCommentSheetPost] = useState<SocialPost | null>(null);

  const activeChallenge = mockChallenges.find((c) => c.status === "active");

  const postComments = commentSheetPost
    ? mockComments.filter((c) => c.postId === commentSheetPost.id)
    : [];

  const handleComment = (postId: string) => {
    const post = mockFeedPosts.find((p) => p.id === postId);
    if (post) setCommentSheetPost(post);
  };

  return (
    <MaxWidthWrapper maxWidth="max-w-7xl" className="py-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ─── Left Sidebar ─── */}
        <aside className="hidden lg:block lg:col-span-3 space-y-6">
          {/* User Quick Stats */}
          <Card className="p-4 bg-linear-to-br from-primary/10 to-primary/5 border-primary/20">
            <Link
              href={`/social/profile/${mockMyProfile.user.id}`}
              className="flex items-center gap-3 mb-4 group"
            >
              <Avatar className="h-14 w-14 ring-2 ring-primary">
                <AvatarImage
                  src={mockMyProfile.user.avatarUrl ?? undefined}
                  alt={mockMyProfile.user.fullName}
                />
                <AvatarFallback className="bg-primary/10 text-primary font-bold">
                  {mockMyProfile.user.fullName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-foreground group-hover:text-primary transition-colors">
                  {mockMyProfile.user.fullName}
                </p>
                <p className="text-sm text-muted-foreground">
                  {LEVEL_LABELS[mockMyProfile.stats.level]}
                </p>
              </div>
            </Link>
            <div
              className="grid grid-cols-3 gap-2 text-center"
              style={{ fontVariantNumeric: "tabular-nums" }}
            >
              <div className="p-2 rounded-lg bg-background/50">
                <p className="font-bold text-lg">{mockMyProfile.stats.recipesCooked}</p>
                <p className="text-xs text-muted-foreground">Recetas</p>
              </div>
              <div className="p-2 rounded-lg bg-background/50">
                <p className="font-bold text-lg">
                  {formatCount(mockMyProfile.stats.followersCount)}
                </p>
                <p className="text-xs text-muted-foreground">Seguidores</p>
              </div>
              <div className="p-2 rounded-lg bg-background/50">
                <p className="font-bold text-lg">{mockMyProfile.stats.followingCount}</p>
                <p className="text-xs text-muted-foreground">Siguiendo</p>
              </div>
            </div>
          </Card>

          {/* Trending Recipes */}
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-5 w-5 text-primary" aria-hidden="true" />
              <h3 className="font-semibold">Tendencias</h3>
            </div>
            <div className="space-y-3">
              {mockExploreData.trendingRecipes.slice(0, 3).map((recipe, idx) => (
                <Link
                  key={recipe.recipeId}
                  href={`/recipes/${recipe.recipeId}`}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 transition-colors"
                >
                  <span
                    className="text-lg font-bold text-muted-foreground w-6"
                    style={{ fontVariantNumeric: "tabular-nums" }}
                  >
                    #{idx + 1}
                  </span>
                  {recipe.recipeImage ? (
                    <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0">
                      <Image
                        src={recipe.recipeImage}
                        alt={recipe.recipeName}
                        fill
                        className="object-cover"
                        sizes="40px"
                      />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                      <ChefHat className="w-5 h-5 text-muted-foreground" aria-hidden="true" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{recipe.recipeName}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Flame className="h-3 w-3 text-orange-500" aria-hidden="true" />
                      <span style={{ fontVariantNumeric: "tabular-nums" }}>
                        {recipe.cookedThisWeek > 0
                          ? `${recipe.cookedThisWeek} esta semana`
                          : `${recipe.cookedCount} cocinadas`}
                      </span>
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </Card>

          {/* Active Streaks */}
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <Flame className="h-5 w-5 text-orange-500" aria-hidden="true" />
              <h3 className="font-semibold">Tus Rachas</h3>
            </div>
            <div className="space-y-3">
              {mockStreaks.map((streak) => (
                <div key={streak.type} className="flex items-center gap-3">
                  <span className="text-xl" aria-hidden="true">
                    {streak.icon}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{streak.label}</p>
                    <div className="flex items-center gap-0.5 mt-0.5">
                      {streak.weekHistory.map((active, i) => (
                        <div
                          key={i}
                          className={cn(
                            "w-3 h-3 rounded-sm",
                            active ? "bg-orange-500" : "bg-muted"
                          )}
                        />
                      ))}
                    </div>
                  </div>
                  <div
                    className="text-right shrink-0"
                    style={{ fontVariantNumeric: "tabular-nums" }}
                  >
                    <p className="text-sm font-bold flex items-center gap-0.5">
                      <Flame className="w-3 h-3 text-orange-500" aria-hidden="true" />
                      {streak.currentStreak}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </aside>

        {/* ─── Main Feed ─── */}
        <div className="lg:col-span-6 space-y-6">
          {/* Stories */}
          <Card className="p-4">
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
              {STORIES.map((story) => (
                <button key={story.id} className="flex flex-col items-center gap-2 min-w-fit">
                  <div
                    className={cn(
                      "relative p-0.5 rounded-full",
                      story.hasNew
                        ? "bg-linear-to-tr from-primary to-orange-400"
                        : story.isOwn
                          ? "bg-border"
                          : "bg-muted"
                    )}
                  >
                    <div className="p-0.5 bg-background rounded-full">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={story.avatar ?? undefined} />
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                          {story.user[0]}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    {story.isOwn ? (
                      <div className="absolute bottom-0 right-0 p-1 bg-primary rounded-full">
                        <Plus className="h-3 w-3 text-primary-foreground" aria-hidden="true" />
                      </div>
                    ) : null}
                  </div>
                  <span className="text-xs font-medium truncate max-w-[70px]">
                    {story.user}
                  </span>
                </button>
              ))}
            </div>
          </Card>

          {/* Insights */}
          <div className="space-y-2">
            {mockInsights.map((insight, i) => (
              <InsightCard key={i} insight={insight} />
            ))}
          </div>

          {/* Create Post */}
          <Card className="p-4">
            <div className="flex gap-3">
              <Avatar className="h-10 w-10 shrink-0">
                <AvatarImage src={mockMyProfile.user.avatarUrl ?? undefined} />
                <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                  {mockMyProfile.user.fullName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-3">
                <Textarea
                  placeholder="¿Qué estás cocinando hoy?"
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  className="min-h-20 resize-none border-0 bg-secondary/50 focus-visible:ring-1"
                  aria-label="Escribe tu publicación"
                />
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="rounded-full gap-2 text-muted-foreground hover:text-primary"
                    >
                      <ImageIcon className="h-4 w-4" aria-hidden="true" />
                      <span className="hidden sm:inline">Foto</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="rounded-full gap-2 text-muted-foreground hover:text-primary"
                    >
                      <Video className="h-4 w-4" aria-hidden="true" />
                      <span className="hidden sm:inline">Video</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="rounded-full gap-2 text-muted-foreground hover:text-primary"
                    >
                      <ChefHat className="h-4 w-4" aria-hidden="true" />
                      <span className="hidden sm:inline">Receta</span>
                    </Button>
                  </div>
                  <Button className="rounded-full gap-2" disabled={!newPost.trim()}>
                    <Send className="h-4 w-4" aria-hidden="true" />
                    Publicar
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          {/* Feed Tabs */}
          <Tabs defaultValue="para-ti" className="w-full">
            <TabsList className="w-full bg-card border border-border/50">
              <TabsTrigger value="para-ti" className="flex-1">
                Para ti
              </TabsTrigger>
              <TabsTrigger value="siguiendo" className="flex-1">
                Siguiendo
              </TabsTrigger>
              <TabsTrigger value="popular" className="flex-1">
                Popular
              </TabsTrigger>
            </TabsList>

            <TabsContent value="para-ti" className="space-y-4 mt-4">
              {mockFeedPosts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onComment={handleComment}
                  onShare={(id) => console.log("Share:", id)}
                />
              ))}
            </TabsContent>

            <TabsContent value="siguiendo" className="space-y-4 mt-4">
              {mockFeedPosts
                .filter((p) => p.isLikedByCurrentUser)
                .map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onComment={handleComment}
                    onShare={(id) => console.log("Share:", id)}
                  />
                ))}
            </TabsContent>

            <TabsContent value="popular" className="space-y-4 mt-4">
              {[...mockFeedPosts]
                .sort((a, b) => b.likesCount - a.likesCount)
                .map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onComment={handleComment}
                    onShare={(id) => console.log("Share:", id)}
                  />
                ))}
            </TabsContent>
          </Tabs>
        </div>

        {/* ─── Right Sidebar ─── */}
        <aside className="hidden lg:block lg:col-span-3 space-y-6">
          {/* Live Activity */}
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="relative">
                <Camera className="h-5 w-5 text-primary" aria-hidden="true" />
                <span className="absolute -top-1 -right-1 h-2 w-2 bg-green-500 rounded-full animate-pulse" />
              </div>
              <h3 className="font-semibold">Actividad en vivo</h3>
            </div>
            <div className="space-y-3">
              {LIVE_ACTIVITIES.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 transition-colors"
                >
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarImage src={activity.user.avatar ?? undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                      {activity.user.name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">
                      <span className="font-medium">{activity.user.name}</span>{" "}
                      <span className="text-muted-foreground">{activity.action}</span>{" "}
                      {activity.recipe ? (
                        <span className="font-medium text-primary">{activity.recipe}</span>
                      ) : null}
                    </p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                  {activity.image ? (
                    <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0">
                      <Image
                        src={activity.image}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="40px"
                      />
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </Card>

          {/* Suggested Users */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" aria-hidden="true" />
                <h3 className="font-semibold">Sugeridos para ti</h3>
              </div>
              <Button variant="link" size="sm" className="text-primary p-0 h-auto">
                Ver todos
              </Button>
            </div>
            <div className="space-y-4">
              {mockExploreData.topChefs.slice(0, 3).map((chef) => (
                <div key={chef.userId} className="flex items-center gap-3">
                  <Link href={`/social/profile/${chef.userId}`}>
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={chef.avatarUrl ?? undefined} alt={chef.fullName} />
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {chef.fullName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link href={`/social/profile/${chef.userId}`}>
                      <p className="font-medium text-sm truncate hover:text-primary transition-colors">
                        {chef.fullName}
                      </p>
                    </Link>
                    <p className="text-xs text-muted-foreground truncate">
                      {LEVEL_LABELS[chef.level]}
                    </p>
                    <p
                      className="text-xs text-muted-foreground"
                      style={{ fontVariantNumeric: "tabular-nums" }}
                    >
                      {formatCount(chef.followersCount)} seguidores
                    </p>
                  </div>
                  <Button variant="default" size="sm" className="rounded-full shrink-0">
                    Seguir
                  </Button>
                </div>
              ))}
            </div>
          </Card>

          {/* Weekly Challenge */}
          {activeChallenge ? (
            <Card className="p-4 bg-linear-to-br from-orange-500/10 to-primary/10 border-primary/20">
              <Badge className="bg-primary/20 text-primary mb-3">Reto Semanal</Badge>
              <h3 className="font-bold text-lg mb-2 text-balance">
                {activeChallenge.icon} {activeChallenge.name}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {activeChallenge.description}
              </p>
              <div
                className="flex items-center gap-4 text-sm text-muted-foreground mb-4"
                style={{ fontVariantNumeric: "tabular-nums" }}
              >
                <span className="flex items-center gap-1">
                  <Award className="h-4 w-4 text-amber-500" aria-hidden="true" />
                  {activeChallenge.xpReward} XP
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" aria-hidden="true" />
                  {activeChallenge.currentProgress}/{activeChallenge.targetProgress}
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2 mb-4">
                <div
                  className="bg-primary rounded-full h-2 transition-[width]"
                  style={{
                    width: `${Math.min(
                      (activeChallenge.currentProgress / activeChallenge.targetProgress) * 100,
                      100
                    )}%`,
                  }}
                />
              </div>
              <Button className="w-full rounded-full">Participar</Button>
            </Card>
          ) : null}
        </aside>
      </div>

      {/* Comment Sheet */}
      <Sheet open={!!commentSheetPost} onOpenChange={() => setCommentSheetPost(null)}>
        <SheetContent
          side="bottom"
          className="h-[85vh] rounded-t-2xl"
          style={{ overscrollBehavior: "contain" }}
        >
          <SheetHeader className="pb-2">
            <SheetTitle className="text-base">
              Comentarios{" "}
              {commentSheetPost ? `(${commentSheetPost.commentsCount})` : null}
            </SheetTitle>
          </SheetHeader>
          <CommentSection
            comments={postComments}
            onAddComment={(content, parentId) => {
              console.log("Add comment:", content, parentId);
            }}
            onLikeComment={(id, isLiked) => {
              console.log("Like comment:", id, isLiked);
            }}
          />
        </SheetContent>
      </Sheet>
    </MaxWidthWrapper>
  );
}
