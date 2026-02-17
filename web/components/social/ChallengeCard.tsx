import { Challenge, MasteryCategory } from "@/types/models/social";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Clock, Zap, CheckCircle2 } from "lucide-react";
import { useState } from "react";

const categoryColors: Record<MasteryCategory, string> = {
  social: "[&>div]:bg-violet-500",
  chef: "[&>div]:bg-orange-500",
  organizer: "[&>div]:bg-emerald-500",
  smart: "[&>div]:bg-blue-500",
};

const categoryBadge: Record<MasteryCategory, { bg: string; text: string }> = {
  social: { bg: "bg-violet-100 dark:bg-violet-900/40", text: "text-violet-700 dark:text-violet-300" },
  chef: { bg: "bg-orange-100 dark:bg-orange-900/40", text: "text-orange-700 dark:text-orange-300" },
  organizer: { bg: "bg-emerald-100 dark:bg-emerald-900/40", text: "text-emerald-700 dark:text-emerald-300" },
  smart: { bg: "bg-blue-100 dark:bg-blue-900/40", text: "text-blue-700 dark:text-blue-300" },
};

interface ChallengeCardProps {
  challenge: Challenge;
}

export default function ChallengeCard({ challenge }: ChallengeCardProps) {
  const [now] = useState(() => Date.now());
  const progress = (challenge.currentProgress / challenge.targetProgress) * 100;
  const isCompleted = challenge.status === "completed";
  const isExpired = challenge.status === "expired";
  /* rendering-hydration: Intl for deterministic date formatting */
  const timeLeft = !isCompleted && !isExpired
    ? new Intl.RelativeTimeFormat("es", { numeric: "auto" }).format(
        Math.ceil((new Date(challenge.endsAt).getTime() - now) / 86400000),
        "day"
      )
    : null;
  const badge = categoryBadge[challenge.category];

  return (
    <Card className={cn(
      "border-border/50 overflow-hidden transition-colors",
      isCompleted && "bg-emerald-50/50 dark:bg-emerald-950/10 border-emerald-200 dark:border-emerald-800",
      isExpired && "opacity-50"
    )}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className={cn(
            "w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0",
            isCompleted
              ? "bg-emerald-100 dark:bg-emerald-900/40"
              : "bg-muted"
          )}>
            {isCompleted ? <CheckCircle2 className="w-6 h-6 text-emerald-500" aria-hidden="true" /> : <span aria-hidden="true">{challenge.icon}</span>}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h4 className="text-sm font-semibold text-foreground">{challenge.name}</h4>
                <p className="text-xs text-muted-foreground">{challenge.description}</p>
              </div>
              <Badge variant="secondary" className={cn("shrink-0 text-[10px] h-5 px-1.5", badge.bg, badge.text)}>
                {challenge.category}
              </Badge>
            </div>

            {/* Progress bar */}
            <div className="space-y-1">
              <Progress
                value={progress}
                className={cn("h-2", categoryColors[challenge.category])}
              />
              <div className="flex items-center justify-between text-[10px] text-muted-foreground" style={{ fontVariantNumeric: "tabular-nums" }}>
                <span>{challenge.currentProgress}/{challenge.targetProgress}</span>
                <div className="flex items-center gap-2">
                  {timeLeft ? (
                    <span className="flex items-center gap-0.5">
                      <Clock className="w-3 h-3" aria-hidden="true" />
                      {timeLeft}
                    </span>
                  ) : null}
                  <span className="flex items-center gap-0.5 text-amber-500 font-medium">
                    <Zap className="w-3 h-3" aria-hidden="true" />
                    +{challenge.xpReward} XP
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
