import { pgTable, text, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

// ─── Workout Plans ────────────────────────────────────────────────────────────

export const workoutPlansTable = pgTable("workout_plans", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull(),
  // Input params
  goal: text("goal").notNull(),
  experience: text("experience").notNull(),
  split: text("split").notNull(),
  daysPerWeek: integer("days_per_week").notNull(),
  location: text("location").notNull(), // home | gym
  additionalNotes: text("additional_notes"),
  // Generated output
  plan: jsonb("plan").notNull(), // WeeklyWorkoutPlan
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertWorkoutPlanSchema = createInsertSchema(workoutPlansTable).omit({
  createdAt: true,
});
export type InsertWorkoutPlan = z.infer<typeof insertWorkoutPlanSchema>;
export type WorkoutPlan = typeof workoutPlansTable.$inferSelect;

// ─── Diet Plans ───────────────────────────────────────────────────────────────

export const dietPlansTable = pgTable("diet_plans", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull(),
  // Input params
  cuisine: text("cuisine").notNull(),
  calorieTarget: integer("calorie_target").notNull(),
  dietStyle: text("diet_style").notNull(), // any | vegetarian | vegan | keto | high_protein | mediterranean
  allergies: text("allergies"),
  // Generated output
  plan: jsonb("plan").notNull(), // DailyDietPlan
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertDietPlanSchema = createInsertSchema(dietPlansTable).omit({
  createdAt: true,
});
export type InsertDietPlan = z.infer<typeof insertDietPlanSchema>;
export type DietPlan = typeof dietPlansTable.$inferSelect;
