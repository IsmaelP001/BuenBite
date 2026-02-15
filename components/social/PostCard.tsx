import { SocialPost } from "@/types/models/social";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
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
  Clock,
  Award,
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

/* rendering-hoist-jsx: static activity config outside component */
const activityConfig: Record<
  string,
  { icon: React.ReactNode; label: string; color: string }
> = {
  recipe_cooked: {
    icon: <ChefHat className="w-3.5 h-3.5" aria-hidden="true" />,
    label: "cocinó una receta",
    color: "text-orange-500",
  },
  recipe_created: {
    icon: <Lightbulb className="w-3.5 h-3.5" aria-hidden="true" />,
    label: "creó una receta",
    color: "text-blue-500",
  },
  recipe_saved: {
    icon: <Bookmark className="w-3.5 h-3.5" aria-hidden="true" />,
    label: "guardó una receta",
    color: "text-purple-500",
  },
  pantry_item_added: {
    icon: <Leaf className="w-3.5 h-3.5" aria-hidden="true" />,
    label: "actualizó su despensa",
    color: "text-green-500",
  },
  pantry_updated: {
    icon: <Leaf className="w-3.5 h-3.5" aria-hidden="true" />,
    label: "actualizó su despensa",
    color: "text-green-500",
  },
  tip_added: {
    icon: <Lightbulb className="w-3.5 h-3.5" aria-hidden="true" />,
    label: "compartió un tip",
    color: "text-yellow-500",
  },
  achievement_unlocked: {
    icon: <Trophy className="w-3.5 h-3.5" aria-hidden="true" />,
    label: "desbloqueó un logro",
    color: "text-amber-500",
  },
  streak_milestone: {
    icon: <Flame className="w-3.5 h-3.5" aria-hidden="true" />,
    label: "alcanzó una racha",
    color: "text-red-500",
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
  const diffMonths = Math.round(diffDays / 30);
  return rtf.format(diffMonths, "month");
}

export default function PostCard({ post, onLike, onComment, onShare }: PostCardProps) {
  const [liked, setLiked] = useState(post.isLikedByCurrentUser);
  const [saved, setSaved] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likesCount);
  const [expanded, setExpanded] = useState(false);

  const activity = post.activityType ? activityConfig[post.activityType] : null;

  const handleLike = useCallback(() => {
    setLiked((prev) => !prev);
    setLikesCount((prev) => (liked ? prev - 1 : prev + 1));
    onLike?.(post.id, liked);
  }, [liked, post.id, onLike]);

  const timeAgo = formatTimeAgo(new Date(post.createdAt));

  const contentTruncated = post.content && post.content.length > 200;
  const displayContent =
    contentTruncated && !expanded ? post.content!.slice(0, 200) + "…" : post.content;

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur overflow-hidden">
      {/* Header */}
      <CardHeader className="flex flex-row items-center gap-3 p-4">
        <Link href={`/social/profile/${post.author.id}`}>
          <Avatar className="h-12 w-12 ring-2 ring-primary/20">
            <AvatarImage
              src={post.author.avatarUrl ?? undefined}
              alt={post.author.fullName}
            />
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {post.author.fullName
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <Link
              href={`/social/profile/${post.author.id}`}
              className="font-semibold text-foreground hover:text-primary transition-colors truncate"
            >
              {post.author.fullName}
            </Link>
            {post.author.level === "master_chef" || post.author.level === "chef" ? (
              <Award
                className="h-4 w-4 text-primary fill-primary shrink-0"
                aria-hidden="true"
              />
            ) : null}
          </div>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            {activity ? (
              <>
                <span className={cn("flex items-center gap-1 text-xs", activity.color)}>
                  {activity.icon}
                  {activity.label}
                </span>
                <span>·</span>
              </>
            ) : null}
            <span className="text-xs">{timeAgo}</span>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full shrink-0"
          aria-label="Más opciones"
        >
          <MoreHorizontal className="h-5 w-5" aria-hidden="true" />
        </Button>
      </CardHeader>

      {/* Content */}
      <CardContent className="p-4 pt-0 space-y-4">
        {post.content ? (
          <div>
            <p className="text-foreground leading-relaxed whitespace-pre-wrap">
              {displayContent}
            </p>
            {contentTruncated ? (
              <button
                onClick={() => setExpanded(!expanded)}
                className="text-primary text-sm font-medium mt-1 hover:underline"
              >
                {expanded ? "Ver menos" : "Ver más"}
              </button>
            ) : null}
          </div>
        ) : null}

        {/* Image */}
        {post.image ? (
          <div className="relative aspect-4/3 rounded-xl overflow-hidden group">
            <Image
              src={post.image}
              alt={post.content || "Post image"}
              fill
              className="object-cover motion-safe:transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 600px"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 motion-safe:transition-opacity" />
          </div>
        ) : null}

        {/* Recipe Link */}
        {post.recipe ? (
          <Link
            href={`/recipes/${post.recipe.id}`}
            className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors"
          >
            <div className="p-2 rounded-lg bg-primary/10 shrink-0">
              <ChefHat className="h-5 w-5 text-primary" aria-hidden="true" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{post.recipe.name}</p>
              {post.recipe.image ? (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" aria-hidden="true" /> Ver receta
                </p>
              ) : null}
            </div>
            <Button variant="secondary" size="sm" className="rounded-full shrink-0">
              Ver receta
            </Button>
          </Link>
        ) : null}

        {/* Achievement Badge */}
        {post.activityType === "achievement_unlocked" && post.metadata ? (
          <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40">
            <span className="text-2xl" aria-hidden="true">
              {(post.metadata as Record<string, string>).achievementIcon || "🏆"}
            </span>
            <div>
              <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                Logro desbloqueado
              </p>
              <p className="text-sm font-bold text-amber-800 dark:text-amber-200">
                {(post.metadata as Record<string, string>).achievementName}
              </p>
            </div>
          </div>
        ) : null}

        {/* Streak Badge */}
        {post.activityType === "streak_milestone" && post.metadata ? (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-linear-to-r from-orange-50 to-red-50 dark:from-orange-950/30 dark:to-red-950/30 border border-orange-200 dark:border-orange-800/40">
            <Flame className="w-8 h-8 text-orange-500 shrink-0" aria-hidden="true" />
            <div>
              <p className="text-xs text-orange-600 dark:text-orange-400 font-medium">
                Racha de cocina
              </p>
              <p
                className="text-lg font-bold text-orange-800 dark:text-orange-200"
                style={{ fontVariantNumeric: "tabular-nums" }}
              >
                {(post.metadata as Record<string, number>).streakDays} días consecutivos
              </p>
            </div>
          </div>
        ) : null}
      </CardContent>

      {/* Footer Actions */}
      <CardFooter
        className="p-4 flex items-center justify-between border-t border-border/50 mt-2"
        style={{ fontVariantNumeric: "tabular-nums" }}
      >
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "rounded-full gap-2",
              liked ? "text-red-500" : "text-muted-foreground"
            )}
            onClick={handleLike}
          >
            <Heart
              className={cn(
                "h-5 w-5 motion-safe:transition-all",
                liked && "fill-current scale-110"
              )}
              aria-hidden="true"
            />
            <span className="text-sm">{likesCount}</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="rounded-full gap-2 text-muted-foreground"
            onClick={() => onComment?.(post.id)}
          >
            <MessageCircle className="h-5 w-5" aria-hidden="true" />
            <span className="text-sm">{post.commentsCount}</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="rounded-full gap-2 text-muted-foreground"
            onClick={() => onShare?.(post.id)}
            aria-label="Compartir"
          >
            <Share2 className="h-5 w-5" aria-hidden="true" />
          </Button>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className={cn("rounded-full", saved ? "text-primary" : "text-muted-foreground")}
          onClick={() => setSaved(!saved)}
          aria-label={saved ? "Quitar de guardados" : "Guardar"}
        >
          <Bookmark
            className={cn("h-5 w-5", saved && "fill-current")}
            aria-hidden="true"
          />
        </Button>
      </CardFooter>
    </Card>
  );
}
