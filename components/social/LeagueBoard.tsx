import { League, LeagueRank } from "@/types/models/social";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Trophy, ArrowUp, ArrowDown, Minus, Crown, Zap, Shield } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const rankConfig: Record<LeagueRank, { label: string; color: string; bg: string; border: string; icon: string }> = {
  bronze: { label: "Bronce", color: "text-amber-700", bg: "bg-amber-100 dark:bg-amber-900/30", border: "border-amber-300 dark:border-amber-700", icon: "🥉" },
  silver: { label: "Plata", color: "text-gray-500", bg: "bg-gray-100 dark:bg-gray-800/40", border: "border-gray-300 dark:border-gray-600", icon: "🥈" },
  gold: { label: "Oro", color: "text-yellow-600", bg: "bg-yellow-50 dark:bg-yellow-900/20", border: "border-yellow-300 dark:border-yellow-700", icon: "🥇" },
  platinum: { label: "Platino", color: "text-cyan-600", bg: "bg-cyan-50 dark:bg-cyan-900/20", border: "border-cyan-300 dark:border-cyan-700", icon: "💎" },
  diamond: { label: "Diamante", color: "text-violet-600", bg: "bg-violet-50 dark:bg-violet-900/20", border: "border-violet-300 dark:border-violet-700", icon: "👑" },
};

const trendIcons = {
  up: <ArrowUp className="w-3.5 h-3.5 text-emerald-500" aria-hidden="true" />,
  down: <ArrowDown className="w-3.5 h-3.5 text-red-500" aria-hidden="true" />,
  same: <Minus className="w-3.5 h-3.5 text-muted-foreground" aria-hidden="true" />,
};

interface LeagueBoardProps {
  league: League;
}

export default function LeagueBoard({ league }: LeagueBoardProps) {
  const [now] = useState(() => Date.now());
  const rank = rankConfig[league.rank];
  /* rendering-hydration: Use Intl for deterministic date formatting */
  const timeLeft = new Intl.RelativeTimeFormat("es", { numeric: "auto" }).format(
    Math.ceil((new Date(league.endsAt).getTime() - now) / 86400000),
    "day"
  );

  return (
    <Card className={cn("border overflow-hidden", rank.border)}>
      {/* Header */}
      <CardHeader className={cn("pb-3", rank.bg)}>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <span className="text-xl">{rank.icon}</span>
            <span className={rank.color}>{league.name}</span>
          </CardTitle>
          <Badge variant="outline" className="text-[10px] font-medium" style={{ fontVariantNumeric: "tabular-nums" }}>
            Termina {timeLeft}
          </Badge>
        </div>
        <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
          <span className="flex items-center gap-1">
            <Crown className="w-3 h-3 text-emerald-500" aria-hidden="true" />
            Top {league.promotionZone} ascienden
          </span>
          <span className="flex items-center gap-1">
            <Shield className="w-3 h-3 text-red-400" aria-hidden="true" />
            Últimos {league.relegationZone} descienden
          </span>
        </div>
      </CardHeader>

      {/* Leaderboard */}
      <CardContent className="p-0">
        <div className="divide-y divide-border/40">
          {league.participants.map((participant) => {
            const isCurrentUser = participant.userId === "current-user";
            const isPromotion = participant.position <= league.promotionZone;
            const isRelegation = participant.position > league.participants.length - league.relegationZone;

            return (
              <Link
                key={participant.userId}
                href={`/social/profile/${participant.userId}`}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/50",
                  /* touch-action: manipulation for mobile */
                  "touch-manipulation",
                  isCurrentUser && "bg-primary/5 dark:bg-primary/10",
                  isPromotion && "border-l-2 border-l-emerald-500",
                  isRelegation && "border-l-2 border-l-red-400"
                )}
              >
                {/* Position */}
                <div className={cn(
                  "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
                  participant.position === 1 && "bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300",
                  participant.position === 2 && "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300",
                  participant.position === 3 && "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300",
                  participant.position > 3 && "bg-muted text-muted-foreground"
                )}>
                  {participant.position <= 3 ? (
                    <Trophy className={cn(
                      "w-3.5 h-3.5",
                      participant.position === 1 && "text-yellow-500",
                      participant.position === 2 && "text-gray-400",
                      participant.position === 3 && "text-amber-600"
                    )} />
                  ) : participant.position}
                </div>

                {/* Avatar */}
                <Avatar className={cn("w-8 h-8 shrink-0", isCurrentUser && "ring-2 ring-primary")}>
                  <AvatarImage src={participant.avatarUrl ?? undefined} />
                  <AvatarFallback className="text-[10px] bg-primary/10 text-primary font-semibold">
                    {participant.fullName.split(" ").map((n) => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>

                {/* Name & XP */}
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    "text-sm truncate",
                    isCurrentUser ? "font-bold text-foreground" : "font-medium text-foreground"
                  )}>
                    {participant.fullName}
                    {isCurrentUser && <span className="text-primary ml-1 text-xs">(tú)</span>}
                  </p>
                </div>

                {/* XP */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="flex items-center gap-0.5 text-xs font-semibold text-amber-600 dark:text-amber-400" style={{ fontVariantNumeric: "tabular-nums" }}>
                    <Zap className="w-3 h-3" aria-hidden="true" />
                    {participant.weeklyXp}
                  </span>
                  {trendIcons[participant.trend]}
                </div>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
