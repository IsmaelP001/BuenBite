/**
 * Gamification Seed Data
 *
 * Run this to populate milestones and initial challenges.
 * Usage: npx tsx src/config/drizzle/seed-gamification.ts
 */
import { db } from "./db";
import {
  milestonesSchema,
  challengesSchema,
} from "./schemas";
import { v4 as uuid } from "uuid";
import { MilestoneType, MasteryCategory, GamificationAction, ChallengeType } from "../../core/domain/gamification.model";

async function seedMilestones() {
  console.log("🏆 Seeding milestones...");

  const milestones = [
    // Chef milestones
    { type: MilestoneType.FIRST_RECIPE_COOKED, name: "Primera Receta Cocinada", description: "¡Cocinaste tu primera receta!", icon: "🍳", category: MasteryCategory.CHEF, xpReward: 50, requiredValue: 1 },
    { type: MilestoneType.RECIPES_COOKED_10, name: "10 Recetas Cocinadas", description: "Has cocinado 10 recetas", icon: "👨‍🍳", category: MasteryCategory.CHEF, xpReward: 100, requiredValue: 10 },
    { type: MilestoneType.RECIPES_COOKED_50, name: "50 Recetas Cocinadas", description: "Has cocinado 50 recetas", icon: "🔪", category: MasteryCategory.CHEF, xpReward: 250, requiredValue: 50 },
    { type: MilestoneType.RECIPES_COOKED_100, name: "Centurión Culinario", description: "Has cocinado 100 recetas", icon: "🏆", category: MasteryCategory.CHEF, xpReward: 500, requiredValue: 100 },
    { type: MilestoneType.RECIPES_COOKED_500, name: "Leyenda de la Cocina", description: "Has cocinado 500 recetas", icon: "💎", category: MasteryCategory.CHEF, xpReward: 1000, requiredValue: 500 },
    { type: MilestoneType.FIRST_RECIPE_CREATED, name: "Creador de Recetas", description: "¡Creaste tu primera receta!", icon: "✍️", category: MasteryCategory.CHEF, xpReward: 50, requiredValue: 1 },
    { type: MilestoneType.RECIPES_CREATED_10, name: "10 Recetas Creadas", description: "Has creado 10 recetas propias", icon: "📝", category: MasteryCategory.CHEF, xpReward: 200, requiredValue: 10 },
    { type: MilestoneType.RECIPES_CREATED_50, name: "Autor Prolífico", description: "Has creado 50 recetas propias", icon: "📚", category: MasteryCategory.CHEF, xpReward: 500, requiredValue: 50 },

    // Organizador milestones
    { type: MilestoneType.FIRST_PANTRY_ITEM, name: "Primeros Pasos en la Despensa", description: "¡Registraste tu primer item en la despensa!", icon: "📦", category: MasteryCategory.ORGANIZADOR, xpReward: 30, requiredValue: 1 },
    { type: MilestoneType.PANTRY_ITEMS_50, name: "Despensa Completa", description: "50 items registrados en la despensa", icon: "🏪", category: MasteryCategory.ORGANIZADOR, xpReward: 200, requiredValue: 50 },
    { type: MilestoneType.ZERO_WASTE_HERO, name: "Héroe Zero Waste", description: "¡Cocinaste con un ingrediente próximo a caducar!", icon: "♻️", category: MasteryCategory.ORGANIZADOR, xpReward: 75, requiredValue: 1 },
    { type: MilestoneType.ZERO_WASTE_10, name: "Campeón Zero Waste", description: "Aprovechaste 10 ingredientes próximos a caducar", icon: "🌱", category: MasteryCategory.ORGANIZADOR, xpReward: 300, requiredValue: 10 },
    { type: MilestoneType.FIRST_PURCHASE, name: "Primera Compra", description: "¡Registraste tu primera compra!", icon: "🛒", category: MasteryCategory.ORGANIZADOR, xpReward: 30, requiredValue: 1 },
    { type: MilestoneType.PURCHASES_20, name: "Comprador Experto", description: "20 compras registradas", icon: "💳", category: MasteryCategory.ORGANIZADOR, xpReward: 200, requiredValue: 20 },

    // Social milestones
    { type: MilestoneType.FIRST_POST, name: "Primer Post", description: "¡Publicaste tu primer post!", icon: "📣", category: MasteryCategory.SOCIAL, xpReward: 30, requiredValue: 1 },
    { type: MilestoneType.FIRST_COMMENT, name: "Primer Comentario", description: "¡Dejaste tu primer comentario!", icon: "💬", category: MasteryCategory.SOCIAL, xpReward: 20, requiredValue: 1 },
    { type: MilestoneType.FOLLOWERS_10, name: "10 Seguidores", description: "¡Tienes 10 seguidores!", icon: "👥", category: MasteryCategory.SOCIAL, xpReward: 100, requiredValue: 10 },
    { type: MilestoneType.FOLLOWERS_50, name: "50 Seguidores", description: "¡Tienes 50 seguidores!", icon: "⭐", category: MasteryCategory.SOCIAL, xpReward: 250, requiredValue: 50 },
    { type: MilestoneType.FOLLOWERS_100, name: "100 Seguidores", description: "¡Tienes 100 seguidores!", icon: "🌟", category: MasteryCategory.SOCIAL, xpReward: 500, requiredValue: 100 },
    { type: MilestoneType.SOCIAL_BUTTERFLY, name: "Mariposa Social", description: "50 interacciones sociales realizadas", icon: "🦋", category: MasteryCategory.SOCIAL, xpReward: 200, requiredValue: 50 },

    // Smart milestones
    { type: MilestoneType.FIRST_MEALPLAN, name: "Primer Plan de Comidas", description: "¡Creaste tu primer plan de comidas!", icon: "📅", category: MasteryCategory.SMART, xpReward: 50, requiredValue: 1 },
    { type: MilestoneType.MEALPLAN_WEEK_COMPLETE, name: "Semana Completa", description: "Completaste un plan de comidas semanal", icon: "✅", category: MasteryCategory.SMART, xpReward: 200, requiredValue: 1 },
    { type: MilestoneType.CALORIE_STREAK_7, name: "7 Días Saludables", description: "7 días consecutivos cumpliendo tu meta calórica", icon: "🎯", category: MasteryCategory.SMART, xpReward: 300, requiredValue: 7 },

    // Streak milestones
    { type: MilestoneType.STREAK_7_DAYS, name: "Racha de 7 Días", description: "¡7 días seguidos! Sigue así", icon: "🔥", category: "general" as any, xpReward: 100, requiredValue: 7 },
    { type: MilestoneType.STREAK_30_DAYS, name: "Racha de 30 Días", description: "¡Un mes completo! Increíble", icon: "🔥🔥", category: "general" as any, xpReward: 300, requiredValue: 30 },
    { type: MilestoneType.STREAK_60_DAYS, name: "Racha de 60 Días", description: "¡2 meses seguidos! Eres imparable", icon: "🔥🔥🔥", category: "general" as any, xpReward: 500, requiredValue: 60 },
    { type: MilestoneType.STREAK_100_DAYS, name: "Racha de 100 Días", description: "¡100 días! Eres una leyenda", icon: "💯", category: "general" as any, xpReward: 1000, requiredValue: 100 },

    // XP milestones
    { type: MilestoneType.XP_1000, name: "1,000 XP", description: "Has acumulado 1,000 puntos de experiencia", icon: "⬆️", category: "general" as any, xpReward: 100, requiredValue: 1000 },
    { type: MilestoneType.XP_5000, name: "5,000 XP", description: "Has acumulado 5,000 puntos de experiencia", icon: "⬆️⬆️", category: "general" as any, xpReward: 250, requiredValue: 5000 },
    { type: MilestoneType.XP_10000, name: "10,000 XP", description: "Has acumulado 10,000 puntos de experiencia", icon: "🚀", category: "general" as any, xpReward: 500, requiredValue: 10000 },
    { type: MilestoneType.XP_50000, name: "50,000 XP", description: "Has acumulado 50,000 puntos de experiencia", icon: "🏅", category: "general" as any, xpReward: 1000, requiredValue: 50000 },
  ];

  for (const m of milestones) {
    await db
      .insert(milestonesSchema)
      .values({
        id: uuid(),
        ...m,
      })
      .onConflictDoNothing();
  }

  console.log(`✅ ${milestones.length} milestones seeded`);
}

async function seedInitialChallenges() {
  console.log("🎯 Seeding initial challenges...");

  const now = new Date();
  const weekEnd = new Date(now);
  weekEnd.setDate(weekEnd.getDate() + 7);

  const monthEnd = new Date(now);
  monthEnd.setMonth(monthEnd.getMonth() + 1);

  const challenges = [
    // Daily challenges
    {
      name: "Cocina del Día",
      description: "Cocina al menos 1 receta hoy",
      icon: "🍳",
      type: ChallengeType.DAILY,
      action: GamificationAction.RECIPE_COOKED,
      targetValue: 1,
      xpReward: 30,
      startDate: now,
      endDate: new Date(now.getTime() + 86_400_000),
    },
    {
      name: "Chef Activo",
      description: "Cocina 3 recetas hoy",
      icon: "👨‍🍳",
      type: ChallengeType.DAILY,
      action: GamificationAction.RECIPE_COOKED,
      targetValue: 3,
      xpReward: 75,
      startDate: now,
      endDate: new Date(now.getTime() + 86_400_000),
    },

    // Weekly challenges
    {
      name: "Chef de la Semana",
      description: "Cocina 10 recetas esta semana",
      icon: "🏆",
      type: ChallengeType.WEEKLY,
      action: GamificationAction.RECIPE_COOKED,
      targetValue: 10,
      xpReward: 200,
      startDate: now,
      endDate: weekEnd,
    },
    {
      name: "Organizador Semanal",
      description: "Registra 15 items en la despensa esta semana",
      icon: "📦",
      type: ChallengeType.WEEKLY,
      action: GamificationAction.PANTRY_ITEM_ADDED,
      targetValue: 15,
      xpReward: 150,
      startDate: now,
      endDate: weekEnd,
    },
    {
      name: "Social Star",
      description: "Crea 5 posts esta semana",
      icon: "⭐",
      type: ChallengeType.WEEKLY,
      action: GamificationAction.POST_CREATED,
      targetValue: 5,
      xpReward: 100,
      startDate: now,
      endDate: weekEnd,
    },

    // Special challenges
    {
      name: "Zero Waste Master",
      description: "Cocina con 5 ingredientes próximos a caducar",
      icon: "♻️",
      type: ChallengeType.SPECIAL,
      action: GamificationAction.USED_EXPIRING_INGREDIENT,
      targetValue: 5,
      xpReward: 300,
      startDate: now,
      endDate: monthEnd,
    },
    {
      name: "Creador Prolífico",
      description: "Crea 5 recetas originales",
      icon: "✍️",
      type: ChallengeType.SPECIAL,
      action: GamificationAction.RECIPE_CREATED,
      targetValue: 5,
      xpReward: 250,
      startDate: now,
      endDate: monthEnd,
    },
  ];

  for (const c of challenges) {
    await db
      .insert(challengesSchema)
      .values({
        id: uuid(),
        ...c,
        isActive: true,
      })
      .onConflictDoNothing();
  }

  console.log(`✅ ${challenges.length} challenges seeded`);
}

async function main() {
  console.log("🎮 Starting gamification seed...\n");
  await seedMilestones();
  await seedInitialChallenges();
  console.log("\n✅ Gamification seed complete!");
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
