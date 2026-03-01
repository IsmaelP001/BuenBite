"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { ACTION_DISPLAY_NAMES } from "@/lib/gamification-constants";
import { Zap } from "lucide-react";

interface PointsToastProps {
  points: number;
  action: string;
  streakMultiplier: number;
  onDone: () => void;
}

/**
 * Animated floating toast that shows earned points.
 * Auto-dismisses after ~3.5s with exit animation.
 */
export function PointsToast({
  points,
  action,
  streakMultiplier,
  onDone,
}: PointsToastProps) {
  const [phase, setPhase] = useState<"enter" | "visible" | "exit">("enter");
  const actionLabel = ACTION_DISPLAY_NAMES[action] ?? action;
  const hasStreak = streakMultiplier > 1;

  useEffect(() => {
    // enter -> visible
    const t1 = setTimeout(() => setPhase("visible"), 50);
    // visible -> exit
    const t2 = setTimeout(() => setPhase("exit"), 3000);
    // exit -> done
    const t3 = setTimeout(() => onDone(), 3500);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onDone]);

  return (
    <div
      className={cn(
        "pointer-events-auto flex items-center gap-3 rounded-2xl border border-primary/20 bg-card px-4 py-3 shadow-lg shadow-primary/10",
        "transition-all duration-500 ease-out",
        phase === "enter" && "translate-y-4 opacity-0 scale-95",
        phase === "visible" && "translate-y-0 opacity-100 scale-100",
        phase === "exit" && "-translate-y-2 opacity-0 scale-95",
      )}
    >
      {/* Points icon with pulse */}
      <div className="relative flex items-center justify-center">
        <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
        <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <Zap className="h-5 w-5" />
        </div>
      </div>

      <div className="flex flex-col">
        <span className="text-sm font-semibold text-foreground">
          +{points} XP
          {hasStreak && (
            <span className="ml-1 text-xs text-primary font-medium">
              (x{streakMultiplier})
            </span>
          )}
        </span>
        <span className="text-xs text-muted-foreground">{actionLabel}</span>
      </div>
    </div>
  );
}

/**
 * Container that stacks multiple PointsToast vertically.
 */
export interface QueuedPointsToast {
  id: string;
  points: number;
  action: string;
  streakMultiplier: number;
}

interface PointsToastContainerProps {
  toasts: QueuedPointsToast[];
  onRemove: (id: string) => void;
}

export function PointsToastContainer({
  toasts,
  onRemove,
}: PointsToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-100 flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <PointsToast
          key={t.id}
          points={t.points}
          action={t.action}
          streakMultiplier={t.streakMultiplier}
          onDone={() => onRemove(t.id)}
        />
      ))}
    </div>
  );
}
