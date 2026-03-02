import { Mastery, MasteryCategory } from "@/types/models/social";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

const categoryStyles: Record<MasteryCategory, { bg: string; border: string; text: string; progressColor: string }> = {
  social: { bg: "bg-violet-50 dark:bg-violet-950/30", border: "border-violet-200 dark:border-violet-800", text: "text-violet-700 dark:text-violet-300", progressColor: "[&>div]:bg-violet-500" },
  chef: { bg: "bg-orange-50 dark:bg-orange-950/30", border: "border-orange-200 dark:border-orange-800", text: "text-orange-700 dark:text-orange-300", progressColor: "[&>div]:bg-orange-500" },
  organizer: { bg: "bg-emerald-50 dark:bg-emerald-950/30", border: "border-emerald-200 dark:border-emerald-800", text: "text-emerald-700 dark:text-emerald-300", progressColor: "[&>div]:bg-emerald-500" },
  smart: { bg: "bg-blue-50 dark:bg-blue-950/30", border: "border-blue-200 dark:border-blue-800", text: "text-blue-700 dark:text-blue-300", progressColor: "[&>div]:bg-blue-500" },
};

interface MasteryCardProps {
  mastery: Mastery;
  compact?: boolean;
}

export default function MasteryCard({ mastery, compact = false }: MasteryCardProps) {
  const style = categoryStyles[mastery.category];
  const currentLevelData = mastery.levels[mastery.currentLevel - 1];
  const nextLevelData = mastery.currentLevel < mastery.maxLevel ? mastery.levels[mastery.currentLevel] : null;
  const progress = nextLevelData
    ? ((mastery.currentXp - currentLevelData.requiredXp) / (nextLevelData.requiredXp - currentLevelData.requiredXp)) * 100
    : 100;

  if (compact) {
    return (
      <div className={cn("flex items-center gap-2 rounded-lg px-3 py-2 border", style.bg, style.border)}>
        <span className="text-lg">{currentLevelData.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span className={cn("text-xs font-semibold", style.text)}>{mastery.label}</span>
            <span className="text-[10px] text-muted-foreground">Nv.{mastery.currentLevel}</span>
          </div>
          <Progress value={progress} className={cn("h-1.5 mt-1", style.progressColor)} />
        </div>
      </div>
    );
  }

  return (
    <Card className={cn("border overflow-hidden", style.border)}>
      <CardContent className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center text-2xl", style.bg)}>
            {currentLevelData.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h3 className={cn("font-bold text-sm", style.text)}>{mastery.label}</h3>
              <span className="text-xs text-muted-foreground font-medium">
                Nivel {mastery.currentLevel}/{mastery.maxLevel}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">{currentLevelData.name}</p>
          </div>
        </div>

        {/* Progress */}
        <div className="space-y-1.5">
          <Progress value={progress} className={cn("h-2", style.progressColor)} />
          <div className="flex items-center justify-between text-[10px] text-muted-foreground" style={{ fontVariantNumeric: "tabular-nums" }}>
            <span>{mastery.currentXp.toLocaleString()} XP</span>
            {nextLevelData ? (
              <span>{nextLevelData.requiredXp.toLocaleString()} XP</span>
            ) : (
              <span className={cn("font-semibold", style.text)}>¡MÁXIMO!</span>
            )}
          </div>
        </div>

        {/* Level indicators */}
        <div className="flex items-center gap-1">
          {mastery.levels.map((lvl) => (
            <div
              key={lvl.level}
              className={cn(
                "flex-1 flex flex-col items-center gap-0.5 py-1.5 rounded-md transition-colors",
                lvl.level <= mastery.currentLevel
                  ? cn(style.bg, "opacity-100")
                  : "bg-muted/50 opacity-40"
              )}
            >
              <span className={cn("text-sm", lvl.level > mastery.currentLevel && "grayscale")}>{lvl.icon}</span>
              <span className="text-[9px] text-muted-foreground leading-none">{lvl.level}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
