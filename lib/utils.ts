import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, parseISO, isValid, parse, toDate } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function extractDateFromDate(date: Date): string {
  if (!isValid(date)) {
    throw new Error("Invalid Date object");
  }
  return format(date, "yyyy-MM-dd");
}

export const getIngredientStatusColor = (status: string) => {
  switch (status) {
    case "COMPLETE":
      return {
        bg: "bg-emerald-500/5 border-emerald-500/20",
        text: "text-emerald-700 dark:text-emerald-400",
        icon: "text-emerald-500",
        iconBg: "bg-emerald-500/10",
      };
    case "PARTIAL":
      return {
        bg: "bg-amber-500/5 border-amber-500/20",
        text: "text-amber-700 dark:text-amber-400",
        icon: "text-amber-500",
        iconBg: "bg-amber-500/10",
      };
    case "MISSING":
      return {
        bg: "bg-red-500/5 border-red-500/20",
        text: "text-red-700 dark:text-red-400",
        icon: "text-red-500",
        iconBg: "bg-red-500/10",
      };

    default:
      return {
        bg: "bg-muted/30 border-transparent",
        text: "text-muted-foreground",
        icon: "text-muted-foreground",
        iconBg: "bg-muted/50",
      };
  }
};

// Para string ISO (ej: "2024-01-15T10:30:00Z")
export function extractDateFromISO(isoString: string): string {
  const date = parseISO(isoString);
  if (!isValid(date)) {
    throw new Error("Invalid ISO string");
  }
  return format(date, "yyyy-MM-dd");
}

export const isValidUrl = (value?: string) => {
  if (!value) return false;
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
};
