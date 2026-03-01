"use client";

import { cn } from "@/lib/utils";
import { User } from "lucide-react";
import {
  getGlobalLevel,
  getXpProgress,
  LEVEL_COLORS,
} from "@/lib/gamification-constants";
import { useEffect, useState, useRef } from "react";
import Image from "next/image";

interface XpBadgeProps {
  totalXp: number;
  globalLevel?: number;
  globalLevelName?: string;
  avatarUrl?: string | null;
  centerLabel?: string;
  floatingTitleLabel?: string;
  size?: "sm" | "md" | "lg";
  animate?: boolean;
  showLevelChip?: boolean;
  className?: string;
}

const SIZES = {
  sm: { container: 36, radius: 14, stroke: 3, icon: 14, fontSize: "text-[8px]" },
  md: { container: 44, radius: 17, stroke: 3.5, icon: 18, fontSize: "text-[10px]" },
  lg: { container: 56, radius: 22, stroke: 4, icon: 22, fontSize: "text-xs" },
};

export function XpBadge({
  totalXp,
  globalLevel,
  globalLevelName,
  avatarUrl,
  centerLabel,
  floatingTitleLabel,
  size = "md",
  animate = false,
  showLevelChip = true,
  className,
}: XpBadgeProps) {
  const { container, radius, stroke, icon, fontSize } = SIZES[size];
  const circumference = 2 * Math.PI * radius;
  const { percent } = getXpProgress(totalXp);
  const levelConfig = getGlobalLevel(totalXp);
  const resolvedLevel = globalLevel ?? levelConfig.level;
  const resolvedLevelName = globalLevelName ?? levelConfig.name;
  const colors = LEVEL_COLORS[resolvedLevel] ?? LEVEL_COLORS[1];

  const [animatedPercent, setAnimatedPercent] = useState(() => percent);
  const prevPercent = useRef(percent);

  useEffect(() => {
    if (!animate) {
      prevPercent.current = percent;
      return;
    }

    const start = prevPercent.current;
    const end = percent;
    if (start === end) return;
    const duration = 800;
    const startTime = performance.now();
    let raf: number;

    const animateFrame = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedPercent(start + (end - start) * eased);

      if (progress < 1) {
        raf = requestAnimationFrame(animateFrame);
      }
    };

    raf = requestAnimationFrame(animateFrame);
    prevPercent.current = percent;

    return () => cancelAnimationFrame(raf);
  }, [percent, animate]);

  const displayPercent = animate ? animatedPercent : percent;
  const dashOffset = circumference - (displayPercent / 100) * circumference;
  const center = container / 2;
  const isNearLevelUp = percent >= 85 && percent < 100;

  return (
    <div
      className={cn(
        "relative inline-flex items-center justify-center",
        animate && "gamification-pulse",
        isNearLevelUp && "drop-shadow-[0_0_8px_hsl(var(--primary)/0.45)]",
        className
      )}
      style={{ width: container, height: container }}
      title={`${floatingTitleLabel ?? resolvedLevelName} · ${totalXp} XP`}
    >
      <svg
        width={container}
        height={container}
        className="absolute inset-0 -rotate-90"
      >
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          className="stroke-muted/40"
        />
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          className={cn(
            colors.ring,
            "transition-[stroke-dashoffset] duration-700 ease-out"
          )}
        />
      </svg>

      <div
        className={cn(
          "relative rounded-full flex items-center justify-center overflow-hidden",
          colors.bg
        )}
        style={{
          width: container - stroke * 2 - 4,
          height: container - stroke * 2 - 4,
        }}
      >
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt="Avatar"
            fill
            className="object-cover rounded-full"
          />
        ) : centerLabel ? (
          <span
            className={cn(
              "px-1 text-center leading-tight font-semibold uppercase",
              size === "sm" ? "text-[7px]" : size === "md" ? "text-[8px]" : "text-[9px]",
              colors.text
            )}
          >
            {centerLabel.slice(0, 3)}
          </span>
        ) : (
          <User
            className={cn("text-muted-foreground", colors.text)}
            style={{ width: icon, height: icon }}
          />
        )}
      </div>



      {resolvedLevel ? (
        <span
          className={cn(
            "absolute top-7 -right-1 z-10 rounded-full border border-background px-1.5 py-0.5 text-[8px] font-bold leading-none text-primary-foreground shadow-md",
            "bg-primary",
            isNearLevelUp && "animate-pulse"
          )}
        >
          LV.{resolvedLevel}
        </span>
      ) : null}

      {showLevelChip && (
        <span
          className={cn(
            "absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full px-1.5 py-0 font-bold leading-tight border-2 border-background",
            fontSize,
            colors.bg,
            colors.text
          )}
        >
          {resolvedLevel}
        </span>
      )}
    </div>
  );
}
