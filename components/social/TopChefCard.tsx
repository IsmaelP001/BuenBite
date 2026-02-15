import { TopChef, UserLevel } from "@/types/models/social";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { ChefHat, Users, Crown, Medal, Award, Star } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface TopChefCardProps {
  chef: TopChef;
  rank: number;
}

const rankStyles: Record<number, { border: string; bg: string; icon: React.ReactNode }> = {
  1: { border: "border-amber-300 dark:border-amber-600", bg: "from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30", icon: <Crown className="w-5 h-5 text-amber-500" aria-hidden="true" /> },
  2: { border: "border-gray-300 dark:border-gray-600", bg: "from-gray-50 to-slate-50 dark:from-gray-950/30 dark:to-slate-950/30", icon: <Medal className="w-5 h-5 text-gray-400" aria-hidden="true" /> },
  3: { border: "border-amber-600 dark:border-amber-800", bg: "from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30", icon: <Award className="w-5 h-5 text-amber-700" aria-hidden="true" /> },
};

const levelConfig: Record<UserLevel, { label: string; color: string }> = {
  novice: { label: "Novato", color: "text-gray-500" },
  cook: { label: "Cocinero", color: "text-blue-500" },
  chef: { label: "Chef", color: "text-purple-500" },
  master_chef: { label: "Master Chef", color: "text-amber-500" },
};

export default function TopChefCard({ chef, rank }: TopChefCardProps) {
  const style = rankStyles[rank] || { border: "border-border", bg: "from-card to-card", icon: <Star className="w-4 h-4 text-muted-foreground" /> };
  const level = levelConfig[chef.level];

  return (
    <Link href={`/social/profile/${chef.userId}`}>
      <Card className={cn("overflow-hidden hover:shadow-lg transition-shadow duration-300 hover:-translate-y-0.5", style.border)}>
        <CardContent className={cn("p-4 bg-linear-to-br", style.bg)}>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Avatar className="w-14 h-14 ring-2 ring-primary/20">
                <AvatarImage src={chef.avatarUrl ?? undefined} alt={chef.fullName} />
                <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg">
                  {chef.fullName.split(" ").map((n) => n[0]).join("")}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-card border-2 border-border flex items-center justify-center shadow-sm">
                {rank <= 3 ? style.icon : <span className="text-[10px] font-bold text-muted-foreground">{rank}</span>}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-sm text-foreground truncate">{chef.fullName}</h4>
              <span className={cn("text-xs font-medium", level.color)}>{level.label}</span>
              <div className="flex items-center gap-3 mt-1" style={{ fontVariantNumeric: "tabular-nums" }}>
                <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                  <ChefHat className="w-3 h-3" aria-hidden="true" />
                  {chef.recipesCooked} recetas
                </span>
                <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                  <Users className="w-3 h-3" aria-hidden="true" />
                  {chef.followersCount.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
