import { Milestone } from "@/types/models/social";
import { cn } from "@/lib/utils";

interface MilestoneGridProps {
  milestones: Milestone[];
}

const rtf = new Intl.RelativeTimeFormat("es", { numeric: "auto" });

function formatTimeAgo(date: Date): string {
  const diffMs = date.getTime() - Date.now();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
  if (Math.abs(diffDays) < 1) return "hoy";
  if (Math.abs(diffDays) < 30) return rtf.format(diffDays, "day");
  const diffMonths = Math.round(diffDays / 30);
  return rtf.format(diffMonths, "month");
}

export default function MilestoneGrid({ milestones }: MilestoneGridProps) {
  const unlocked = milestones.filter((m) => m.isUnlocked);
  const locked = milestones.filter((m) => !m.isUnlocked);

  return (
    <div className="space-y-5">
      {/* Unlocked */}
      {unlocked.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
            <span>🏅</span> Conseguidos ({unlocked.length})
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {unlocked.map((milestone) => (
              <div
                key={milestone.id}
                className="flex flex-col items-center text-center p-3 rounded-xl bg-amber-50/80 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/40 gap-1.5"
              >
                <span className="text-2xl">{milestone.icon}</span>
                <span className="text-xs font-semibold text-foreground leading-tight">{milestone.name}</span>
                <span className="text-[10px] text-muted-foreground leading-tight">{milestone.description}</span>
                {milestone.unlockedAt && (
                  <span className="text-[9px] text-amber-600 dark:text-amber-400 font-medium mt-0.5">
                    {formatTimeAgo(new Date(milestone.unlockedAt))}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Locked */}
      {locked.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-muted-foreground">
            Por desbloquear ({locked.length})
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {locked.map((milestone) => (
              <div
                key={milestone.id}
                className={cn(
                  "flex flex-col items-center text-center p-3 rounded-xl border gap-1.5",
                  "bg-muted/30 border-border/40 opacity-60"
                )}
              >
                <span className="text-2xl grayscale">{milestone.icon}</span>
                <span className="text-xs font-medium text-muted-foreground leading-tight">{milestone.name}</span>
                <span className="text-[10px] text-muted-foreground/70 leading-tight">{milestone.description}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
