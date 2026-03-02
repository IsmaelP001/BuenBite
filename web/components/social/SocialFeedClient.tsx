"use client";

import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import MaxWidthWrapper from "@/components/MaxWithWrapper";
import PostCard from "@/components/social/PostCard";
import CommentSection from "@/components/social/CommentSection";
import InsightCard from "@/components/social/InsightCard";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Image as ImageIcon,
  ChefHat,
  TrendingUp,
  Users,
  Clock,
  Send,
  Flame,
  Award,
  Search,
  X,
  Loader2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { SocialPost } from "@/types/models/social";
import type { SearchRecipe } from "@/types/models/recipes";

import { useSocialFeed } from "@/hooks/social/useSocialFeed";
import {
  useCreatePost,
  useToggleLikePost,
} from "@/hooks/social/useSocialPosts";
import {
  useGetComments,
  useAddComment,
  useToggleLikeComment,
} from "@/hooks/social/useSocialComments";
import { useGetExplore, useGetInsights } from "@/hooks/social/useSocialExplore";
import { useGetProfile } from "@/hooks/social/useSocialProfile";
import {
  useFollowUser,
  useGetFollowing,
  useUnfollowUser,
} from "@/hooks/social/useSocialFollows";
import {
  useGamificationSummary,
  useMyChallenges,
  useMyStreaks,
} from "@/hooks/gamification/useGamification";
import useSearchRecipes from "@/hooks/useSearchRecipes";
import { ProfileCard } from "./ProfileCard";

const LEVEL_LABELS: Record<string, string> = {
  novice: "Novato",
  cook: "Cocinero",
  chef: "Chef",
  master_chef: "Master Chef",
};

function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}

interface SocialFeedClientProps {
  currentUserId: string;
}

export default function SocialFeedClient({
  currentUserId,
}: SocialFeedClientProps) {
  const [newPost, setNewPost] = useState("");
  const [newPostImagePreview, setNewPostImagePreview] = useState<string | null>(
    null,
  );
  const [newPostImageFile, setNewPostImageFile] = useState<File | null>(null);
  const [recipeQuery, setRecipeQuery] = useState("");
  const [debouncedRecipeQuery, setDebouncedRecipeQuery] = useState("");
  const [selectedRecipe, setSelectedRecipe] = useState<SearchRecipe | null>(
    null,
  );
  const [showRecipePicker, setShowRecipePicker] = useState(false);
  const [followOverrides, setFollowOverrides] = useState<
    Record<string, boolean>
  >({});
  const [pendingFollowUserId, setPendingFollowUserId] = useState<string | null>(
    null,
  );
  const [commentSheetPost, setCommentSheetPost] = useState<SocialPost | null>(
    null,
  );
  const imageInputRef = useRef<HTMLInputElement>(null);

  const { data: feedPosts = [], isLoading: feedLoading } = useSocialFeed({
    limit: 20,
  });
  const { data: followingPosts = [] } = useSocialFeed({
    followingOnly: true,
    limit: 20,
  });
  const { data: myProfile } = useGetProfile(currentUserId);
  const { data: gamificationSummary } = useGamificationSummary(Boolean(currentUserId));
  const { data: exploreData } = useGetExplore();
  const { data: insights = [] } = useGetInsights();
  const { data: followingUsers = [] } = useGetFollowing(currentUserId, {
    enabled: Boolean(currentUserId),
    page: "1",
    limit: "200",
  });
  const { data: searchedRecipes = [] } = useSearchRecipes({
    searchParams: {
      query: debouncedRecipeQuery,
      limit: 6,
    },
  });

  const { data: streaks = [] } = useMyStreaks();
  const { data: myChallenges = [] } = useMyChallenges("true");
  const { data: postComments = [], isLoading: commentsLoading } =
    useGetComments(commentSheetPost?.id ?? "", !!commentSheetPost);

  // ─── Mutations ──────────────────────────────────────────────────────────
  const createPost = useCreatePost();
  const toggleLike = useToggleLikePost();
  const addComment = useAddComment();
  const toggleLikeComment = useToggleLikeComment();
  const followUser = useFollowUser();
  const unfollowUser = useUnfollowUser();

  const popularPosts = [...feedPosts].sort(
    (a, b) => b.likesCount - a.likesCount,
  );
  const followingSet = useMemo(
    () => new Set(followingUsers.map((user) => user.userId)),
    [followingUsers],
  );

  const activeChallenge = myChallenges.find((c) => c.status === "active");
  const isCreatingPost = createPost.isPending;
  const canCreatePost = Boolean(
    newPost.trim() || selectedRecipe || newPostImageFile,
  );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedRecipeQuery(recipeQuery.trim());
    }, 250);

    return () => window.clearTimeout(timer);
  }, [recipeQuery]);

  useEffect(() => {
    return () => {
      if (newPostImagePreview) URL.revokeObjectURL(newPostImagePreview);
    };
  }, [newPostImagePreview]);

  // ─── Handlers ───────────────────────────────────────────────────────────
  const handleComment = (postId: string) => {
    const post = feedPosts.find((p) => p.id === postId);
    if (post) setCommentSheetPost(post);
  };

  const handleShare = (postId: string) => {
    // TODO: implement share flow
    console.log("Share:", postId);
  };

  const resetPostComposer = () => {
    if (newPostImagePreview) {
      URL.revokeObjectURL(newPostImagePreview);
    }
    setNewPost("");
    setNewPostImageFile(null);
    setNewPostImagePreview(null);
    setRecipeQuery("");
    setDebouncedRecipeQuery("");
    setSelectedRecipe(null);
    setShowRecipePicker(false);
    if (imageInputRef.current) imageInputRef.current.value = "";
  };

  const handleCreatePost = async () => {
    if (!canCreatePost || isCreatingPost) return;
    try {
      const recipeMetadata = selectedRecipe
        ? {
            notes: null,
            cookImage: null,
            recipeName: selectedRecipe.name,
            recipeImage: selectedRecipe.image ?? null,
          }
        : null;

      const uploadData = new FormData();
      uploadData.append("content", newPost.trim());
      if (newPostImageFile) {
        uploadData.append("image", newPostImageFile);
      }
      if (selectedRecipe?.id) {
        uploadData.append("recipeId", selectedRecipe.id);
      }
      if (recipeMetadata) {
        uploadData.append("metadata", JSON.stringify(recipeMetadata));
      }

      await createPost.mutateAsync(uploadData);

      resetPostComposer();
    } catch {
      // Error is handled by mutation toasts.
    }
  };

  const handlePickImage = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (newPostImagePreview) {
      URL.revokeObjectURL(newPostImagePreview);
    }

    const previewUrl = URL.createObjectURL(file);
    setNewPostImageFile(file);
    setNewPostImagePreview(previewUrl);
  };

  const handleClearImage = () => {
    if (newPostImagePreview) {
      URL.revokeObjectURL(newPostImagePreview);
    }
    setNewPostImageFile(null);
    setNewPostImagePreview(null);
    if (imageInputRef.current) imageInputRef.current.value = "";
  };

  const handleLikePost = (postId: string, isLiked: boolean) => {
    toggleLike.mutate({ postId, isLiked });
  };

  const handleAddComment = (content: string, parentCommentId?: string) => {
    if (!commentSheetPost) return;
    addComment.mutate({
      postId: commentSheetPost.id,
      data: { content, parentCommentId },
    });
  };

  const handleLikeComment = (commentId: string, isLiked: boolean) => {
    toggleLikeComment.mutate({ commentId, isLiked });
  };

  const isFollowingUser = (userId: string) =>
    followOverrides[userId] ?? followingSet.has(userId);

  const sortedSuggestedChefs = [...(exploreData?.topChefs ?? [])].sort(
    (a, b) =>
      Number(followOverrides[a.userId] ?? followingSet.has(a.userId)) -
      Number(followOverrides[b.userId] ?? followingSet.has(b.userId)),
  );

  const profileCardData = useMemo(() => {
    if (!myProfile) return null;
    if (!gamificationSummary) return myProfile;

    return {
      ...myProfile,
      stats: {
        ...myProfile.stats,
        xp: gamificationSummary.totalXp,
        globalLevel: gamificationSummary.globalLevel,
        globalLevelName: gamificationSummary.globalLevelName,
        pointsToday: gamificationSummary.pointsToday,
        pointsThisWeek: gamificationSummary.pointsThisWeek,
      },
    };
  }, [myProfile, gamificationSummary]);

  const handleFollowUser = (userId: string) => {
    const currentlyFollowing = isFollowingUser(userId);
    setPendingFollowUserId(userId);
    setFollowOverrides((prev) => ({ ...prev, [userId]: !currentlyFollowing }));

    const rollback = () => {
      setFollowOverrides((prev) => ({ ...prev, [userId]: currentlyFollowing }));
    };

    if (currentlyFollowing) {
      unfollowUser.mutate(userId, {
        onError: rollback,
        onSettled: () => setPendingFollowUserId(null),
      });
      return;
    }

    followUser.mutate(userId, {
      onError: rollback,
      onSettled: () => setPendingFollowUserId(null),
    });
  };

  return (
    <MaxWidthWrapper maxWidth="max-w-7xl" className="py-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <aside className="hidden lg:block lg:col-span-3 space-y-6">
          {profileCardData ? (
            <ProfileCard myProfile={profileCardData} formatCount={formatCount} />
          ) : null}

          {exploreData ? (
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp
                  className="h-5 w-5 text-primary"
                  aria-hidden="true"
                />
                <h3 className="font-semibold">Tendencias</h3>
              </div>
              <div className="space-y-3">
                {exploreData.trendingRecipes.slice(0, 3).map((recipe, idx) => (
                  <Link
                    key={recipe.recipeId}
                    href={`/recipes/${recipe.recipeId}`}
                    className="flex items-center gap-3 px-2 py-1 rounded-lg hover:bg-secondary/50 transition-colors"
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
                        <ChefHat
                          className="w-5 h-5 text-muted-foreground"
                          aria-hidden="true"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {recipe.recipeName}
                      </p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Flame
                          className="h-3 w-3 text-orange-500"
                          aria-hidden="true"
                        />
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
          ) : null}

          {streaks.length > 0 ? (
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <Flame className="h-5 w-5 text-orange-500" aria-hidden="true" />
                <h3 className="font-semibold">Tus Rachas</h3>
              </div>
              <div className="space-y-2">
                {streaks.map((streak) => (
                  <div key={streak.id} className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate capitalize">
                        {streak.streakType}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Mejor: {streak.longestCount} días
                      </p>
                    </div>
                    <div
                      className="text-right shrink-0"
                      style={{ fontVariantNumeric: "tabular-nums" }}
                    >
                      <p className="text-sm font-bold flex items-center gap-0.5">
                        <Flame
                          className="w-3 h-3 text-orange-500"
                          aria-hidden="true"
                        />
                        {streak.currentCount}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ) : null}
        </aside>

        {/* ─── Main Feed ─── */}
        <div className="lg:col-span-6 space-y-6">
          {/* Create Post */}
          <Card className="p-4">
            <div className="flex gap-3">
              <Avatar className="h-10 w-10 shrink-0">
                <AvatarImage src={myProfile?.user.avatarUrl ?? undefined} />
                <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                  {myProfile?.user.fullName
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("") ?? "?"}
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
                {newPostImagePreview ? (
                  <div className="relative w-full max-w-xs rounded-xl overflow-hidden border border-border/60">
                    <div className="relative aspect-square">
                      <Image
                        src={newPostImagePreview}
                        alt="Vista previa de imagen para la publicación"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="absolute top-2 right-2 h-7 w-7 rounded-full"
                      onClick={handleClearImage}
                      aria-label="Quitar imagen"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : null}

                {selectedRecipe ? (
                  <div className="flex items-center justify-between gap-2 rounded-lg bg-secondary/50 border border-border/60 px-3 py-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <ChefHat className="h-4 w-4 text-primary shrink-0" />
                      <p className="text-sm font-medium truncate">
                        {selectedRecipe.name}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 rounded-full shrink-0"
                      onClick={() => setSelectedRecipe(null)}
                      aria-label="Quitar receta"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : null}

                {showRecipePicker ? (
                  <div className="space-y-2 rounded-lg border border-border/60 p-3 bg-card">
                    <div className="relative">
                      <Search className="h-4 w-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                      <Input
                        value={recipeQuery}
                        onChange={(e) => setRecipeQuery(e.target.value)}
                        placeholder="Buscar receta..."
                        className="pl-9"
                      />
                    </div>
                    {debouncedRecipeQuery ? (
                      <div className="max-h-48 overflow-auto space-y-1">
                        {searchedRecipes.length > 0 ? (
                          searchedRecipes.map((recipe) => (
                            <button
                              key={recipe.id}
                              type="button"
                              className="w-full text-left flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-secondary/70"
                              onClick={() => {
                                setSelectedRecipe(recipe);
                                setRecipeQuery("");
                                setDebouncedRecipeQuery("");
                                setShowRecipePicker(false);
                              }}
                            >
                              <div className="w-8 h-8 rounded-md overflow-hidden bg-muted shrink-0 relative">
                                {recipe.image ? (
                                  <Image
                                    src={recipe.image}
                                    alt={recipe.name}
                                    fill
                                    className="object-cover"
                                  />
                                ) : (
                                  <div className="h-full w-full flex items-center justify-center">
                                    <ChefHat className="h-4 w-4 text-muted-foreground" />
                                  </div>
                                )}
                              </div>
                              <span className="text-sm truncate">
                                {recipe.name}
                              </span>
                            </button>
                          ))
                        ) : (
                          <p className="text-xs text-muted-foreground px-1 py-2">
                            No encontramos recetas para esa búsqueda.
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        Escribe para buscar y seleccionar una receta.
                      </p>
                    )}
                  </div>
                ) : null}
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="rounded-full gap-2 text-muted-foreground hover:text-primary"
                      onClick={() => imageInputRef.current?.click()}
                      type="button"
                    >
                      <ImageIcon className="h-4 w-4" aria-hidden="true" />
                      <span className="hidden sm:inline">Foto</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="rounded-full gap-2 text-muted-foreground hover:text-primary"
                      onClick={() => setShowRecipePicker((prev) => !prev)}
                      type="button"
                    >
                      <ChefHat className="h-4 w-4" aria-hidden="true" />
                      <span className="hidden sm:inline">Receta</span>
                    </Button>
                    <input
                      ref={imageInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handlePickImage}
                    />
                  </div>
                  <Button
                    className="rounded-full gap-2"
                    disabled={!canCreatePost || isCreatingPost}
                    onClick={handleCreatePost}
                  >
                    {isCreatingPost ? (
                      <Loader2
                        className="h-4 w-4 animate-spin"
                        aria-hidden="true"
                      />
                    ) : (
                      <Send className="h-4 w-4" aria-hidden="true" />
                    )}
                    Publicar
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          {/* Insights */}
          {insights.length > 0 ? (
            <div className="space-y-2">
              {insights.map((insight, i) => (
                <InsightCard key={i} insight={insight} />
              ))}
            </div>
          ) : null}

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
              {feedLoading ? (
                <FeedSkeleton />
              ) : feedPosts.length > 0 ? (
                feedPosts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onComment={handleComment}
                    onShare={handleShare}
                    onLike={handleLikePost}
                  />
                ))
              ) : (
                <EmptyFeed />
              )}
            </TabsContent>

            <TabsContent value="siguiendo" className="space-y-4 mt-4">
              {followingPosts.length > 0 ? (
                followingPosts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onComment={handleComment}
                    onShare={handleShare}
                    onLike={handleLikePost}
                  />
                ))
              ) : (
                <EmptyFeed message="Sigue a otros chefs para ver sus publicaciones aquí" />
              )}
            </TabsContent>

            <TabsContent value="popular" className="space-y-4 mt-4">
              {popularPosts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onComment={handleComment}
                  onShare={handleShare}
                  onLike={handleLikePost}
                />
              ))}
            </TabsContent>
          </Tabs>
        </div>

        <aside className="hidden lg:block lg:col-span-3 space-y-6">
          {exploreData?.topChefs && exploreData.topChefs.length > 0 ? (
            <Card className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" aria-hidden="true" />
                  <h3 className="font-semibold">Sugeridos para ti</h3>
                </div>
                <Link href="/social/discover-users">
                  <Button
                    variant="link"
                    size="sm"
                    className="h-auto p-0 text-primary"
                  >
                    Buscar mas
                  </Button>
                </Link>
              </div>
              <div className="space-y-4">
                {sortedSuggestedChefs.slice(0, 3).map((chef) => (
                  <div key={chef.userId} className="flex items-center gap-3">
                    <Link href={`/social/profile/${chef.userId}`}>
                      <Avatar className="h-12 w-12">
                        <AvatarImage
                          src={chef.avatarUrl ?? undefined}
                          alt={chef.fullName}
                        />
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
                    {chef.userId !== currentUserId ? (
                      <Button
                        variant={
                          isFollowingUser(chef.userId) ? "secondary" : "default"
                        }
                        size="sm"
                        className="rounded-full shrink-0"
                        onClick={() => handleFollowUser(chef.userId)}
                        disabled={pendingFollowUserId === chef.userId}
                      >
                        {isFollowingUser(chef.userId) ? "Siguiendo" : "Seguir"}
                      </Button>
                    ) : null}
                  </div>
                ))}
              </div>
            </Card>
          ) : null}

          {/* Weekly Challenge */}
          {activeChallenge ? (
            <Card className="p-4 bg-linear-to-br from-orange-500/10 to-primary/10 border-primary/20">
              <Badge className="bg-primary/20 text-primary mb-3">
                Reto Semanal
              </Badge>
              <h3 className="font-bold text-lg mb-2 text-balance">
                {activeChallenge.challenge?.icon}{" "}
                {activeChallenge.challenge?.name}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {activeChallenge.challenge?.description}
              </p>
              <div
                className="flex items-center gap-4 text-sm text-muted-foreground mb-4"
                style={{ fontVariantNumeric: "tabular-nums" }}
              >
                <span className="flex items-center gap-1">
                  <Award
                    className="h-4 w-4 text-amber-500"
                    aria-hidden="true"
                  />
                  {activeChallenge.challenge?.xpReward ?? 0} XP
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" aria-hidden="true" />
                  {activeChallenge.currentProgress}/
                  {activeChallenge.challenge?.targetValue ?? 0}
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2 mb-4">
                <div
                  className="bg-primary rounded-full h-2 transition-[width]"
                  style={{
                    width: `${Math.min(
                      (activeChallenge.currentProgress /
                        (activeChallenge.challenge?.targetValue ?? 1)) *
                        100,
                      100,
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
      <Sheet
        open={!!commentSheetPost}
        onOpenChange={() => setCommentSheetPost(null)}
      >
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
          {commentsLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <CommentSection
              comments={postComments}
              onAddComment={handleAddComment}
              onLikeComment={handleLikeComment}
            />
          )}
        </SheetContent>
      </Sheet>
    </MaxWidthWrapper>
  );
}

// ─── Skeleton / Empty States ──────────────────────────────────────────────────

function FeedSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="p-4">
          <div className="flex gap-3 animate-pulse">
            <div className="h-10 w-10 rounded-full bg-muted" />
            <div className="flex-1 space-y-3">
              <div className="h-4 w-1/3 bg-muted rounded" />
              <div className="h-3 w-full bg-muted rounded" />
              <div className="h-3 w-2/3 bg-muted rounded" />
              <div className="h-48 w-full bg-muted rounded-lg" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

function EmptyFeed({
  message = "No hay publicaciones aún",
}: {
  message?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mb-3 text-muted-foreground">
        <ChefHat className="w-8 h-8" />
      </div>
      <p className="text-sm font-medium text-foreground">Sin publicaciones</p>
      <p className="text-xs text-muted-foreground mt-1">{message}</p>
    </div>
  );
}
