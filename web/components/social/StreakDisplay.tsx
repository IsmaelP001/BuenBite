import { StreakData } from "@/types/models/social";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Flame, Trophy } from "lucide-react";

interface StreakDisplayProps {
  streaks: StreakData[];
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

export default function StreakDisplay({ streaks }: StreakDisplayProps) {
  return (
    <div className="space-y-3">
      {streaks.map((streak) => (
        <Card key={streak.type} className="border-border/50 overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              {/* Icon & Current */}
              <div className="flex flex-col items-center gap-1">
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center text-2xl",
                  streak.currentStreak > 0
                    ? "bg-orange-100 dark:bg-orange-950/40"
                    : "bg-muted"
                )}>
                  {streak.icon}
                </div>
                <div className="flex items-center gap-0.5 text-orange-500" style={{ fontVariantNumeric: "tabular-nums" }}>
                  <Flame className="w-3 h-3" aria-hidden="true" />
                  <span className="text-xs font-bold">{streak.currentStreak}</span>
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-foreground">{streak.label}</h4>
                  <div className="flex items-center gap-1 text-muted-foreground" style={{ fontVariantNumeric: "tabular-nums" }}>
                    <Trophy className="w-3 h-3 text-amber-500" aria-hidden="true" />
                    <span className="text-xs">Mejor: {streak.longestStreak} {streak.unit}</span>
                  </div>
                </div>

                {/* Week History */}
                <div className="flex items-center gap-1">
                  {["L", "M", "X", "J", "V", "S", "D"].map((day, i) => (
                    <div key={day} className="flex flex-col items-center gap-0.5 flex-1">
                      <div
                        className={cn(
                          "w-full aspect-square rounded-md flex items-center justify-center transition-all",
                          streak.weekHistory[i]
                            ? "bg-orange-500 dark:bg-orange-600"
                            : "bg-muted"
                        )}
                      >
                        {streak.weekHistory[i] && (
                          <span className="text-white text-[10px]">✓</span>
                        )}
                      </div>
                      <span className="text-[9px] text-muted-foreground">{day}</span>
                    </div>
                  ))}
                </div>

                <p className="text-[10px] text-muted-foreground">
                  Última actividad: {formatTimeAgo(new Date(streak.lastActivity))}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
