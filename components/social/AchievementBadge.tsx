import { UserAchievement, Achievement } from "@/types/models/social";
import { cn } from "@/lib/utils";
import { Lock } from "lucide-react";

interface AchievementBadgeProps {
  achievement: Achievement;
  unlocked?: UserAchievement;
  size?: "sm" | "md" | "lg";
}

const sizeClasses: Record<string, string> = {
  sm: "w-14 h-14",
  md: "w-18 h-18",
  lg: "w-24 h-24",
};

const iconSizes: Record<string, string> = {
  sm: "text-xl",
  md: "text-3xl",
  lg: "text-4xl",
};

const rtf = new Intl.RelativeTimeFormat("es", { numeric: "auto" });

function formatTimeAgo(date: Date): string {
  const diffMs = date.getTime() - Date.now();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
  if (Math.abs(diffDays) < 1) return "hoy";
  if (Math.abs(diffDays) < 30) return rtf.format(diffDays, "day");
  const diffMonths = Math.round(diffDays / 30);
  return rtf.format(diffMonths, "month");
}

export default function AchievementBadge({ achievement, unlocked, size = "md" }: AchievementBadgeProps) {
  const isUnlocked = !!unlocked;

  return (
    <div className="flex flex-col items-center gap-1.5 group">
      <div
        className={cn(
          "relative rounded-2xl flex items-center justify-center transition-all duration-300",
          sizeClasses[size],
          isUnlocked
            ? "bg-linear-to-br from-amber-100 to-orange-100 dark:from-amber-900/40 dark:to-orange-900/40 shadow-lg shadow-amber-200/50 dark:shadow-amber-900/30 group-hover:scale-105 group-hover:shadow-xl"
            : "bg-muted/60 opacity-50 grayscale"
        )}
      >
        <span className={cn(iconSizes[size], isUnlocked ? "" : "opacity-40")}>{achievement.icon}</span>
        {!isUnlocked && (
          <div className="absolute inset-0 rounded-2xl flex items-center justify-center bg-black/10 dark:bg-black/30">
            <Lock className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
          </div>
        )}
      </div>
      <div className="text-center max-w-20">
        <p className={cn("text-[10px] font-semibold leading-tight", isUnlocked ? "text-foreground" : "text-muted-foreground")}>
          {achievement.name}
        </p>
        {unlocked && (
          <p className="text-[8px] text-muted-foreground mt-0.5">
            {formatTimeAgo(new Date(unlocked.unlockedAt))}
          </p>
        )}
      </div>
    </div>
  );
}
