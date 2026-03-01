import { SocialPost } from "@/types/models/social";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import {
  Heart,
  MessageCircle,
  Share2,
  MoreHorizontal,
  Bookmark,
  ChefHat,
  Flame,
  Trophy,
  Leaf,
  Lightbulb,
  Award,
  Star,
  ArrowRight,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";

interface PostCardProps {
  post: SocialPost;
  onLike?: (postId: string, isLiked: boolean) => void;
  onComment?: (postId: string) => void;
  onShare?: (postId: string) => void;
}

const activityConfig: Record<
  string,
  { icon: React.ReactNode; label: string; pill: string }
> = {
  recipe_cooked: {
    icon: <ChefHat className="w-3 h-3" aria-hidden="true" />,
    label: "cocinó una receta",
    pill: "bg-orange-100 text-orange-600 dark:bg-orange-500/15 dark:text-orange-400",
  },
  recipe_created: {
    icon: <Lightbulb className="w-3 h-3" aria-hidden="true" />,
    label: "creó una receta",
    pill: "bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400",
  },
  recipe_saved: {
    icon: <Bookmark className="w-3 h-3" aria-hidden="true" />,
    label: "guardó una receta",
    pill: "bg-purple-100 text-purple-600 dark:bg-purple-500/15 dark:text-purple-400",
  },
  pantry_item_added: {
    icon: <Leaf className="w-3 h-3" aria-hidden="true" />,
    label: "actualizó su despensa",
    pill: "bg-green-100 text-green-600 dark:bg-green-500/15 dark:text-green-400",
  },
  pantry_updated: {
    icon: <Leaf className="w-3 h-3" aria-hidden="true" />,
    label: "actualizó su despensa",
    pill: "bg-green-100 text-green-600 dark:bg-green-500/15 dark:text-green-400",
  },
  tip_added: {
    icon: <Lightbulb className="w-3 h-3" aria-hidden="true" />,
    label: "compartió un tip",
    pill: "bg-yellow-100 text-yellow-600 dark:bg-yellow-500/15 dark:text-yellow-400",
  },
  achievement_unlocked: {
    icon: <Trophy className="w-3 h-3" aria-hidden="true" />,
    label: "desbloqueó un logro",
    pill: "bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400",
  },
  streak_milestone: {
    icon: <Flame className="w-3 h-3" aria-hidden="true" />,
    label: "alcanzó una racha",
    pill: "bg-red-100 text-red-600 dark:bg-red-500/15 dark:text-red-400",
  },
};

const rtf = new Intl.RelativeTimeFormat("es", { numeric: "auto" });

function formatTimeAgo(date: Date): string {
  const diffMs = date.getTime() - Date.now();
  const diffSec = Math.round(diffMs / 1000);
  if (Math.abs(diffSec) < 60) return rtf.format(diffSec, "second");
  const diffMin = Math.round(diffSec / 60);
  if (Math.abs(diffMin) < 60) return rtf.format(diffMin, "minute");
  const diffHours = Math.round(diffMin / 60);
  if (Math.abs(diffHours) < 24) return rtf.format(diffHours, "hour");
  const diffDays = Math.round(diffHours / 24);
  if (Math.abs(diffDays) < 30) return rtf.format(diffDays, "day");
  return rtf.format(Math.round(diffDays / 30), "month");
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div
      className="flex items-center gap-0.5"
      aria-label={`${rating} de 5 estrellas`}
    >
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={cn(
            "w-3.5 h-3.5",
            i <= Math.round(rating)
              ? "fill-amber-400 text-amber-400"
              : "fill-muted text-muted-foreground/30",
          )}
          aria-hidden="true"
        />
      ))}
      <span className="ml-1 text-xs font-semibold text-amber-600 dark:text-amber-400 tabular-nums">
        {rating.toFixed(1)}
      </span>
    </div>
  );
}

export default function PostCard({
  post,
  onLike,
  onComment,
  onShare,
}: PostCardProps) {
  const [liked, setLiked] = useState(post.isLikedByCurrentUser);
  const [likesCount, setLikesCount] = useState(post.likesCount);
  const [expanded, setExpanded] = useState(false);

  const activity = post.activityType ? activityConfig[post.activityType] : null;
  const meta = post.metadata as Record<string, unknown> | undefined;
  const rating = meta?.rating != null ? Number(meta.rating) : null;
  const recipeName = meta?.recipeName as string | undefined;
  const notes = meta?.notes as string | undefined;

  const handleLike = useCallback(() => {
    setLiked((prev) => !prev);
    setLikesCount((prev) => (liked ? prev - 1 : prev + 1));
    onLike?.(post.id, liked);
  }, [liked, post.id, onLike]);

  const timeAgo = formatTimeAgo(new Date(post.createdAt));
  const contentTruncated = post.content && post.content.length > 200;
  const displayContent =
    contentTruncated && !expanded
      ? post.content!.slice(0, 200) + "…"
      : post.content;

  const isRecipeActivity =
    post.activityType === "recipe_cooked" ||
    post.activityType === "recipe_created" ||
    post.activityType === "recipe_saved" ||
    Boolean(post.recipeId);

  return (
    <Card className="border border-border/60 bg-card shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
      <CardHeader className="flex flex-row items-center gap-3 px-4 pt-4 pb-3">
        <Link href={`/social/profile/${post.author.id}`} className="shrink-0">
          <Avatar className="h-10 w-10 ring-2 ring-primary/20 ring-offset-1 ring-offset-background">
            <AvatarImage
              src={post.author.avatarUrl ?? undefined}
              alt={post.author.fullName}
            />
            <AvatarFallback className="bg-primary/10 text-primary font-bold text-sm">
              {post.author.fullName
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)}
            </AvatarFallback>
          </Avatar>
        </Link>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <Link
              href={`/social/profile/${post.author.id}`}
              className="font-semibold text-sm text-foreground hover:text-primary transition-colors truncate"
            >
              {post.author.fullName}
            </Link>
            {(post.author.level === "master_chef" ||
              post.author.level === "chef") && (
              <Award
                className="h-3.5 w-3.5 text-primary fill-primary shrink-0"
                aria-hidden="true"
              />
            )}
          </div>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            {activity && (
              <span
                className={cn(
                  "inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[11px] font-medium",
                  activity.pill,
                )}
              >
                {activity.icon}
                {activity.label}
              </span>
            )}
            <span className="text-[11px] text-muted-foreground">{timeAgo}</span>
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="rounded-full h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground"
          aria-label="Más opciones"
        >
          <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
        </Button>
      </CardHeader>

      {post.image && (
        <div className="relative aspect-4/3 overflow-hidden group">
          <Image
            src={post.image}
            alt={post.content || "Post image"}
            fill
            className="object-cover  transition-transform duration-500 group-hover:scale-[1.03]"
            sizes="(max-width: 768px) 100vw, 600px"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
      )}

      <CardContent className="px-4 pt-3 pb-2 space-y-3">
        {post.content && (
          <div>
            <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
              {displayContent}
            </p>
            {contentTruncated && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="text-primary text-xs font-semibold mt-1 hover:underline"
              >
                {expanded ? "Ver menos" : "Ver más"}
              </button>
            )}
          </div>
        )}

        {notes && (
          <blockquote className="border-l-2 border-primary/40 pl-3 text-xs italic text-muted-foreground">
            {notes}
          </blockquote>
        )}

        {isRecipeActivity && post.recipeId && (
          <Link
            href={`/recipes/${post.recipeId}`}
            className="group flex items-center gap-3 p-3 rounded-xl bg-muted/60 hover:bg-muted border border-border/50 transition-colors"
          >
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <ChefHat className="h-4 w-4 text-primary" aria-hidden="true" />
            </div>
            <div className="flex-1 min-w-0">
              {recipeName && (
                <p className="text-sm font-semibold truncate text-foreground">
                  {recipeName}
                </p>
              )}
              {rating != null && (
                <div className="mt-0.5">
                  <StarRating rating={rating} />
                </div>
              )}
            </div>
            <ArrowRight
              className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0"
              aria-hidden="true"
            />
          </Link>
        )}

        {post.activityType === "achievement_unlocked" && meta && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-linear-to-r from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/20 border border-amber-200/60 dark:border-amber-700/30">
            <span className="text-2xl shrink-0" aria-hidden="true">
              {(meta.achievementIcon as string) || "🏆"}
            </span>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-500 dark:text-amber-400">
                Logro desbloqueado
              </p>
              <p className="text-sm font-bold text-amber-900 dark:text-amber-200 mt-0.5">
                {meta.achievementName as string}
              </p>
            </div>
          </div>
        )}

        {post.activityType === "streak_milestone" && meta && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-linear-to-r from-orange-50 to-red-50 dark:from-orange-950/30 dark:to-red-950/20 border border-orange-200/60 dark:border-orange-700/30">
            <div className="relative shrink-0">
              <Flame className="w-7 h-7 text-orange-500" aria-hidden="true" />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-orange-500 dark:text-orange-400">
                Racha de cocina
              </p>
              <p className="text-base font-bold text-orange-900 dark:text-orange-200 mt-0.5 tabular-nums">
                {meta.streakDays as number} días consecutivos 🔥
              </p>
            </div>
          </div>
        )}
      </CardContent>

      {/* Footer */}
      <CardFooter className="px-3 py-2 flex items-center justify-between border-t border-border/40">
        <div className="flex items-center">
          <button
            onClick={handleLike}
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-sm font-medium transition-colors",
              liked
                ? "text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
                : "text-muted-foreground hover:text-red-400 hover:bg-muted",
            )}
          >
            <Heart
              className={cn(
                "h-4 w-4 transition-all",
                liked && "fill-current scale-110",
              )}
              aria-hidden="true"
            />
            <span className="text-xs tabular-nums">{likesCount}</span>
          </button>

          <button
            onClick={() => onComment?.(post.id)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <MessageCircle className="h-4 w-4" aria-hidden="true" />
            <span className="text-xs tabular-nums">{post.commentsCount}</span>
          </button>

          <button
            onClick={() => onShare?.(post.id)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label="Compartir"
          >
            <Share2 className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

  
      </CardFooter>
    </Card>
  );
}
