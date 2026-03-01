"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ALERT_TYPE_CONFIG, LEVEL_COLORS } from "@/lib/gamification-constants";
import type { GamificationAlertType } from "@/types/models/gamification";

interface AchievementModalProps {
  open: boolean;
  alertType: GamificationAlertType;
  title: string;
  message: string;
  icon: string;
  data: Record<string, unknown> | null;
  onDismiss: () => void;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function _AchievementModal(props: AchievementModalProps) { return null; }

export function AchievementModal({
  open,
  alertType,
  title: alertTitle,
  message: alertMessage,
  icon,
  data,
  onDismiss,
}: AchievementModalProps) {
  const [showContent, setShowContent] = useState(false);
  const config = ALERT_TYPE_CONFIG[alertType] ?? {
    title: "¡Logro!",
    emoji: "🎖️",
  };

  useEffect(() => {
    if (open) {
      const t = setTimeout(() => setShowContent(true), 300);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [open]);

  // Reset content state when modal closes
  useEffect(() => {
    if (!open) {
      const t = setTimeout(() => setShowContent(false), 0);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [open]);

  const isLevelUp =
    alertType === "global_level_up" || alertType === "mastery_level_up";
  const newLevel = data?.newLevel as number | undefined;
  const levelColors = LEVEL_COLORS[newLevel ?? 1] ?? LEVEL_COLORS[1];

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onDismiss()}>
      <DialogContent className="sm:max-w-md border-primary/20 overflow-hidden">
        {/* Animated background glow */}
        <div
          className={cn(
            "absolute inset-0 opacity-0 transition-opacity duration-1000",
            showContent && "opacity-100"
          )}
        >
          <div className="absolute inset-0 bg-linear-to-b from-primary/5 via-transparent to-transparent" />
          {isLevelUp && (
            <>
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 rounded-full bg-primary/10 blur-3xl achievement-glow" />
              <div className="achievement-particles" aria-hidden>
                {Array.from({ length: 12 }).map((_, i) => (
                  <span
                    key={i}
                    className="achievement-particle"
                    style={
                      {
                        "--i": i,
                        "--total": 12,
                      } as React.CSSProperties
                    }
                  />
                ))}
              </div>
            </>
          )}
        </div>

        <DialogHeader className="relative z-10">
          <DialogTitle className="text-center sr-only">
            {config.title}
          </DialogTitle>
          <DialogDescription className="sr-only">{alertMessage}</DialogDescription>
        </DialogHeader>

        <div className="relative z-10 flex flex-col items-center gap-4 py-4">
          {/* Main icon / badge */}
          <div
            className={cn(
              "flex items-center justify-center w-24 h-24 rounded-full text-5xl",
              "transition-all duration-700 ease-out",
              showContent
                ? "scale-100 opacity-100"
                : "scale-50 opacity-0",
              isLevelUp
                ? cn(levelColors.bg, "ring-4 ring-primary/30 achievement-badge-bounce")
                : "bg-primary/10 achievement-badge-bounce"
            )}
          >
            {icon || config.emoji}
          </div>

          {/* Title */}
          <h3
            className={cn(
              "text-xl font-bold text-center transition-all duration-500 delay-200",
              showContent
                ? "translate-y-0 opacity-100"
                : "translate-y-4 opacity-0"
            )}
          >
            {config.title}
          </h3>

          {/* Alert title (specific name) */}
          <p
            className={cn(
              "text-base font-semibold text-primary text-center transition-all duration-500 delay-300",
              showContent
                ? "translate-y-0 opacity-100"
                : "translate-y-4 opacity-0"
            )}
          >
            {String(alertTitle)}
          </p>

          {/* Message */}
          <p
            className={cn(
              "text-sm text-muted-foreground text-center max-w-xs transition-all duration-500 delay-400",
              showContent
                ? "translate-y-0 opacity-100"
                : "translate-y-4 opacity-0"
            )}
          >
            {String(alertMessage)}
          </p>

          {/* Level up specific: level badge */}
          {isLevelUp && newLevel && (
            <div
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-700 delay-500",
                showContent
                  ? "scale-100 opacity-100"
                  : "scale-75 opacity-0",
                levelColors.bg
              )}
            >
              <span className={cn("text-lg font-bold", levelColors.text)}>
                Nivel {newLevel}
              </span>
              {data?.levelName ? (
                <span className={cn("text-sm font-medium", levelColors.text)}>
                  · {String(data.levelName)}
                </span>
              ) : null}
            </div>
          )}

          {/* XP reward if present */}
          {data?.xpReward ? (
            <div
              className={cn(
                "text-sm font-semibold text-primary transition-all duration-500 delay-500",
                showContent ? "opacity-100" : "opacity-0"
              )}
            >
              +{String(data.xpReward)} XP
            </div>
          ) : null}

          {/* Dismiss button */}
          <Button
            variant="hero"
            className={cn(
              "mt-2 transition-all duration-500 delay-700",
              showContent
                ? "translate-y-0 opacity-100"
                : "translate-y-4 opacity-0"
            )}
            onClick={onDismiss}
          >
            ¡Genial!
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
