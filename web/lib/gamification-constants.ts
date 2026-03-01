// ─── Global Level Thresholds (mirrored from server domain) ──────────────────

export interface GlobalLevelConfig {
  level: number;
  name: string;
  requiredXp: number;
}

export const GLOBAL_LEVELS: GlobalLevelConfig[] = [
  { level: 1, name: "Novato", requiredXp: 0 },
  { level: 2, name: "Iniciado", requiredXp: 200 },
  { level: 3, name: "Aprendiz", requiredXp: 500 },
  { level: 4, name: "Cocinero", requiredXp: 1000 },
  { level: 5, name: "Cocinero Avanzado", requiredXp: 2000 },
  { level: 6, name: "Chef Junior", requiredXp: 4000 },
  { level: 7, name: "Chef", requiredXp: 7000 },
  { level: 8, name: "Chef Senior", requiredXp: 12000 },
  { level: 9, name: "Chef Ejecutivo", requiredXp: 20000 },
  { level: 10, name: "Master Chef", requiredXp: 35000 },
  { level: 11, name: "Gran Master Chef", requiredXp: 50000 },
  { level: 12, name: "Leyenda Culinaria", requiredXp: 100000 },
];

export function getGlobalLevel(totalXp: number): GlobalLevelConfig {
  const sorted = [...GLOBAL_LEVELS].sort(
    (a, b) => b.requiredXp - a.requiredXp
  );
  for (const level of sorted) {
    if (totalXp >= level.requiredXp) {
      return level;
    }
  }
  return GLOBAL_LEVELS[0];
}

export function getNextLevel(
  totalXp: number
): GlobalLevelConfig | null {
  const current = getGlobalLevel(totalXp);
  return GLOBAL_LEVELS.find((l) => l.level === current.level + 1) ?? null;
}

export function getXpProgress(totalXp: number): {
  current: number;
  needed: number;
  percent: number;
} {
  const currentLevel = getGlobalLevel(totalXp);
  const nextLevel = getNextLevel(totalXp);

  if (!nextLevel) {
    return { current: totalXp, needed: totalXp, percent: 100 };
  }

  const xpInLevel = totalXp - currentLevel.requiredXp;
  const xpForLevel = nextLevel.requiredXp - currentLevel.requiredXp;
  const percent = Math.min((xpInLevel / xpForLevel) * 100, 100);

  return { current: xpInLevel, needed: xpForLevel, percent };
}


export const ACTION_DISPLAY_NAMES: Record<string, string> = {
  recipe_cooked: "Receta cocinada",
  recipe_created: "Receta creada",
  recipe_saved: "Receta guardada",
  pantry_item_added: "Item añadido a despensa",
  pantry_item_updated: "Despensa actualizada",
  purchase_registered: "Compra registrada",
  post_created: "Post creado",
  comment_added: "Comentario añadido",
  post_liked: "Like dado",
  user_followed: "Usuario seguido",
  recipe_shared: "Receta compartida",
  tip_added: "Tip añadido",
  mealplan_entry_created: "Plan de comida creado",
  mealplan_completed: "Plan completado",
  calorie_goal_met: "Meta calórica cumplida",
  used_expiring_ingredient: "Ingrediente aprovechado",
  challenge_completed: "Reto completado",
};

// ─── Level badge colors ─────────────────────────────────────────────────────

export const LEVEL_COLORS: Record<number, { ring: string; bg: string; text: string }> = {
  1: { ring: "stroke-stone-400", bg: "bg-stone-100", text: "text-stone-700" },
  2: { ring: "stroke-amber-500", bg: "bg-amber-100", text: "text-amber-800" },
  3: { ring: "stroke-amber-600", bg: "bg-amber-200", text: "text-amber-900" },
  4: { ring: "stroke-orange-500", bg: "bg-orange-100", text: "text-orange-800" },
  5: { ring: "stroke-orange-600", bg: "bg-orange-200", text: "text-orange-900" },
  6: { ring: "stroke-lime-600", bg: "bg-lime-100", text: "text-lime-800" },
  7: { ring: "stroke-emerald-600", bg: "bg-emerald-100", text: "text-emerald-800" },
  8: { ring: "stroke-sky-600", bg: "bg-sky-100", text: "text-sky-800" },
  9: { ring: "stroke-indigo-600", bg: "bg-indigo-100", text: "text-indigo-800" },
  10: { ring: "stroke-violet-600", bg: "bg-violet-100", text: "text-violet-800" },
  11: { ring: "stroke-fuchsia-600", bg: "bg-fuchsia-100", text: "text-fuchsia-800" },
  12: { ring: "stroke-rose-600", bg: "bg-rose-100", text: "text-rose-800" },
};

export const ALERT_TYPE_CONFIG: Record<string, { title: string; emoji: string }> = {
  milestone_unlocked: { title: "¡Hito desbloqueado!", emoji: "🏆" },
  mastery_level_up: { title: "¡Subiste de maestría!", emoji: "⬆️" },
  global_level_up: { title: "¡Subiste de nivel!", emoji: "🎉" },
  challenge_completed: { title: "¡Reto completado!", emoji: "✅" },
  weekly_title_earned: { title: "¡Título semanal!", emoji: "👑" },
};
