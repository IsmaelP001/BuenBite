"use client";

import { Button } from "@/components/ui/button";
import useGetRecipeTips from "@/hooks/useGetRecipeTips";
import { Heart, Lightbulb } from "lucide-react";
const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};



export default function RecipeTips() {
  const { data: tips,isPending } = useGetRecipeTips();
  return (
    <div className="bg-card rounded-xl p-6 shadow-sm border">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-yellow-500" />
          <h2 className="font-display text-xl font-semibold">
            Tips de la Comunidad
          </h2>
        </div>
        <Button variant="outline" size="sm">
          Añadir Tip
        </Button>
      </div>
       {isPending &&( <div className="flex items-center justify-center gap-2">
          <p>Cargando...</p>
        </div>)}
      {tips && tips.length > 0 ? (
        <div className="space-y-4">
          {tips.map((tip) => (
            <div
              key={tip.id}
              className="p-4 bg-secondary/30 rounded-lg border border-border/50"
            >
              <div className="flex items-start gap-3">
                {tip?.user?.fullName && (
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                    {getInitials(tip?.user?.fullName)}
                  </div>
                )}
                <div className="flex-1">
                  <p className="font-medium text-sm mb-1">
                    {tip.user?.fullName}
                  </p>
                  <p className="text-muted-foreground text-sm">{tip.tip}</p>
                  <div className="flex items-center gap-1 mt-2 text-muted-foreground">
                    <Heart className="w-4 h-4" />
                    <span className="text-xs">{5}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div>
          <h2>añadir tip</h2>
        </div>
      )}
    </div>
  );
}
