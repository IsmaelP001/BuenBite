import { UserLevel } from "@/types/models/social";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface UserCardProps {
  userId: string;
  fullName: string;
  avatarUrl: string | null;
  level?: UserLevel;
  subtitle?: string;
  isFollowing?: boolean;
  showFollowButton?: boolean;
  onFollow?: (userId: string) => void;
  onUnfollow?: (userId: string) => void;
  compact?: boolean;
}

const levelConfig: Record<UserLevel, { label: string; color: string }> = {
  novice: { label: "Novato", color: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300" },
  cook: { label: "Cocinero", color: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" },
  chef: { label: "Chef", color: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300" },
  master_chef: { label: "Master Chef", color: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300" },
};

export default function UserCard({
  userId,
  fullName,
  avatarUrl,
  level,
  subtitle,
  isFollowing,
  showFollowButton = true,
  onFollow,
  onUnfollow,
  compact,
}: UserCardProps) {
  const levelInfo = level ? levelConfig[level] : null;

  return (
    <div className={cn(
      "flex items-center gap-3 group",
      compact ? "py-1.5" : "py-2"
    )}>
      <Link href={`/social/profile/${userId}`} className="shrink-0">
        <Avatar className={cn(
          "ring-2 ring-primary/10 group-hover:ring-primary/30 transition-[ring-color]",
          compact ? "w-9 h-9" : "w-11 h-11"
        )}>
          <AvatarImage src={avatarUrl ?? undefined} alt={fullName} />
          <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
            {fullName.split(" ").map((n) => n[0]).join("")}
          </AvatarFallback>
        </Avatar>
      </Link>
      <div className="flex-1 min-w-0">
        <Link href={`/social/profile/${userId}`} className="block">
          <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors truncate block">
            {fullName}
          </span>
        </Link>
        <div className="flex items-center gap-1.5">
          {levelInfo && (
            <span className={cn("text-[10px] font-medium px-1.5 py-0.5 rounded-full", levelInfo.color)}>
              {levelInfo.label}
            </span>
          )}
          {subtitle && (
            <span className="text-xs text-muted-foreground truncate">{subtitle}</span>
          )}
        </div>
      </div>
      {showFollowButton && (
        <Button
          variant={isFollowing ? "outline" : "default"}
          size="sm"
          className={cn(
            "h-7 px-3 text-xs shrink-0 rounded-full",
            isFollowing
              ? "border-border hover:border-destructive hover:text-destructive"
              : "bg-primary text-primary-foreground hover:bg-primary/90"
          )}
          onClick={() => isFollowing ? onUnfollow?.(userId) : onFollow?.(userId)}
        >
          {isFollowing ? "Siguiendo" : "Seguir"}
        </Button>
      )}
    </div>
  );
}
