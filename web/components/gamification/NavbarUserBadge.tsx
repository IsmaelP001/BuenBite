"use client";

import { useAuth } from "@/lib/context/authContext";
import { useGamificationSummary } from "@/hooks/gamification/useGamification";
import { XpBadge } from "@/components/gamification/XpBadge";
import { Heart, LogOut, Settings, Star, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { getGlobalLevel, getNextLevel, getXpProgress } from "@/lib/gamification-constants";

/**
 * Shows the XP badge (circular progress + level) for authenticated users,
 * or a plain User icon button for guests.
 */
export function NavbarUserBadge() {
  const router = useRouter();
  const { user, loading: authLoading, signOut } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const { data: summary, isLoading: summaryLoading } = useGamificationSummary(
    !!user
  );
  const totalXp = summary?.totalXp ?? 0;
  const computedLevel = getGlobalLevel(totalXp);
  const xpProgress = getXpProgress(totalXp);
  const nextLevel = getNextLevel(totalXp);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    await signOut();
    setIsSigningOut(false);
  };

  const getUserInitials = () => {
    const fullName =
      user?.user_metadata?.full_name ??
      user?.user_metadata?.name ??
      user?.email ??
      "";

    const parts = String(fullName)
      .trim()
      .split(/\s+/)
      .filter(Boolean);

    if (parts.length === 0) return "U";
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();

    return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
  };

  if (authLoading) {
    return <Skeleton className="h-11 w-11 rounded-full" />;
  }

  if (!user) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="rounded-full"
        aria-label="Iniciar sesión"
        onClick={() => router.push("/auth/signin")}
      >
        <User className="h-5 w-5" />
      </Button>
    );
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-11 rounded-full p-1 pr-3 gap-2"
          aria-label="Abrir menú de usuario"
        >
          <XpBadge
            totalXp={totalXp}
            globalLevel={computedLevel.level}
            globalLevelName={computedLevel.name}
            centerLabel={getUserInitials()}
            floatingTitleLabel={computedLevel.name}
            animate={!summaryLoading}
            size="md"
            showLevelChip={false}
            className="transition-transform hover:scale-105"
          />
          <div className="hidden md:flex flex-col items-start leading-none">
            <span className="max-w-28 truncate text-[11px] font-semibold">
              {computedLevel.name}
            </span>
            <span className="text-[10px] text-muted-foreground">
              {nextLevel ? `${xpProgress.current}/${xpProgress.needed} XP` : "Nivel máximo"}
            </span>
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-64 p-2">
        <div className="grid gap-1">
          <Button variant="ghost" className="justify-start" asChild>
            <Link href="/user/favorites">
              <Heart className="mr-2 h-4 w-4" />
              Ver favoritos
            </Link>
          </Button>
          <Button variant="ghost" className="justify-start" asChild>
            <Link href="/user/recipes">
              <Star className="mr-2 h-4 w-4" />
              Recetas guardadas
            </Link>
          </Button>
          <Button variant="ghost" className="justify-start" asChild>
            <Link href="/settings">
              <Settings className="mr-2 h-4 w-4" />
              Configuraciones
            </Link>
          </Button>
          <div className="my-1 border-t border-border" />
          <Button
            variant="ghost"
            className="justify-start text-destructive hover:text-destructive"
            onClick={handleSignOut}
            disabled={isSigningOut}
          >
            <LogOut className="mr-2 h-4 w-4" />
            {isSigningOut ? "Cerrando sesión..." : "Logout"}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
