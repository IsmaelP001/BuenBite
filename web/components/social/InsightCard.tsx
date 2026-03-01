import { SocialInsight } from "@/types/models/social";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, ShoppingBasket, AlertTriangle, ArrowRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface InsightCardProps {
  insight: SocialInsight;
}

const insightConfig = {
  followers_cooked: {
    icon: Users,
    accent: "text-blue-500 dark:text-blue-400",
    iconBg: "bg-blue-100 dark:bg-blue-500/15",
    bar: "bg-blue-500",
    countColor: "text-blue-600 dark:text-blue-400",
    border: "border-l-blue-500",
  },
  ingredients_available: {
    icon: ShoppingBasket,
    accent: "text-emerald-500 dark:text-emerald-400",
    iconBg: "bg-emerald-100 dark:bg-emerald-500/15",
    bar: "bg-emerald-500",
    countColor: "text-emerald-600 dark:text-emerald-400",
    border: "border-l-emerald-500",
  },
  expiring_ingredients: {
    icon: AlertTriangle,
    accent: "text-amber-500 dark:text-amber-400",
    iconBg: "bg-amber-100 dark:bg-amber-500/15",
    bar: "bg-amber-500",
    countColor: "text-amber-600 dark:text-amber-400",
    border: "border-l-amber-500",
  },
} satisfies Record<string, {
  icon: React.ElementType;
  accent: string;
  iconBg: string;
  bar: string;
  countColor: string;
  border: string;
}>;

export default function InsightCard({ insight }: InsightCardProps) {
  const config = insightConfig[insight.type as keyof typeof insightConfig] ?? insightConfig.followers_cooked;
  const Icon = config.icon;

  return (
    <Card
      className={cn(
        "overflow-hidden border-l-[3px] shadow-none rounded-lg transition-shadow hover:shadow-sm py-3 ",
        config.border
      )}
    >
      <CardContent className="p-0">
        <div className="flex items-center gap-2.5 px-3">
          {/* Icon */}
          <div className={cn("shrink-0 w-7 h-7 rounded-md flex items-center justify-center", config.iconBg)}>
            <Icon className={cn("w-3.5 h-3.5", config.accent)} aria-hidden="true" />
          </div>

          {/* Text */}
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-medium text-foreground leading-tight truncate">
              {insight.message}
            </p>
            {insight.count != null && (
              <p className={cn("text-[11px] font-semibold tabular-nums mt-0.5", config.countColor)}>
                {insight.count} {insight.count === 1 ? "elemento" : "elementos"}
              </p>
            )}
          </div>

          {/* CTA */}
          {insight.recipeId && (
            <Link href={`/recipes/${insight.recipeId}`}>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "shrink-0 h-6 w-6 rounded-md",
                  "hover:bg-foreground/8 dark:hover:bg-white/10"
                )}
                aria-label="Ver receta"
              >
                <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" aria-hidden="true" />
              </Button>
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  );
}