import { SocialInsight } from "@/types/models/social";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, ShoppingBasket, AlertTriangle, ArrowRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface InsightCardProps {
  insight: SocialInsight;
}

const insightConfig: Record<string, { icon: React.ReactNode; gradient: string; border: string }> = {
  followers_cooked: {
    icon: <Users className="w-5 h-5" aria-hidden="true" />,
    gradient: "from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30",
    border: "border-blue-200 dark:border-blue-800/40",
  },
  ingredients_available: {
    icon: <ShoppingBasket className="w-5 h-5" aria-hidden="true" />,
    gradient: "from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30",
    border: "border-green-200 dark:border-green-800/40",
  },
  expiring_ingredients: {
    icon: <AlertTriangle className="w-5 h-5" aria-hidden="true" />,
    gradient: "from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30",
    border: "border-amber-200 dark:border-amber-800/40",
  },
};

export default function InsightCard({ insight }: InsightCardProps) {
  const config = insightConfig[insight.type] || insightConfig.followers_cooked;

  return (
    <Card className={cn("overflow-hidden", config.border)}>
      <CardContent className={cn("p-4 bg-linear-to-r flex items-center gap-3", config.gradient)}>
        <div className="shrink-0 w-10 h-10 rounded-full bg-white/60 dark:bg-white/10 flex items-center justify-center text-foreground">
          {config.icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground leading-snug">{insight.message}</p>
          {insight.count && (
            <p className="text-xs text-muted-foreground mt-0.5">
              {insight.count} {insight.count === 1 ? "elemento" : "elementos"}
            </p>
          )}
        </div>
        {insight.recipeId && (
          <Link href={`/recipes/${insight.recipeId}`}>
            <Button variant="ghost" size="icon" className="shrink-0 h-8 w-8 rounded-full hover:bg-white/60 dark:hover:bg-white/10" aria-label="Ver receta">
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Button>
          </Link>
        )}
      </CardContent>
    </Card>
  );
}
