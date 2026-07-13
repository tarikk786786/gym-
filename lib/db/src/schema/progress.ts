import {
  pgTable,
  text,
  integer,
  real,
  boolean,
  timestamp,
  date,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

// ─── Daily Progress Logs ──────────────────────────────────────────────────────

export const progressLogsTable = pgTable("progress_logs", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull(),
  logDate: date("log_date", { mode: "string" }).notNull(), // YYYY-MM-DD

  // Body metrics
  weightKg: real("weight_kg"),
  bodyFatPercent: real("body_fat_percent"),

  // Body measurements (cm)
  chestCm: real("chest_cm"),
  waistCm: real("waist_cm"),
  hipsCm: real("hips_cm"),
  armsCm: real("arms_cm"),
  thighsCm: real("thighs_cm"),
  shouldersCm: real("shoulders_cm"),

  // Daily habits
  caloriesConsumed: integer("calories_consumed"),
  waterLiters: real("water_liters"),
  sleepHours: real("sleep_hours"),
  stressLevel: integer("stress_level"), // 1-10

  // Workout
  workoutCompleted: boolean("workout_completed").default(false),
  workoutDurationMin: integer("workout_duration_min"),
  workoutNotes: text("workout_notes"),

  // General notes
  notes: text("notes"),
  mood: text("mood"), // great | good | okay | bad | terrible

  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const insertProgressLogSchema = createInsertSchema(
  progressLogsTable,
).omit({ createdAt: true, updatedAt: true });
export type InsertProgressLog = z.infer<typeof insertProgressLogSchema>;
export type ProgressLog = typeof progressLogsTable.$inferSelect;

// ─── Personal Records ─────────────────────────────────────────────────────────

export const prRecordsTable = pgTable("pr_records", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull(),
  exercise: text("exercise").notNull(),
  weightKg: real("weight_kg"),
  reps: integer("reps"),
  distanceKm: real("distance_km"),
  durationSec: integer("duration_sec"),
  notes: text("notes"),
  achievedAt: date("achieved_at", { mode: "string" }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const insertPrRecordSchema = createInsertSchema(prRecordsTable).omit({
  createdAt: true,
});
export type InsertPrRecord = z.infer<typeof insertPrRecordSchema>;
export type PrRecord = typeof prRecordsTable.$inferSelect;
