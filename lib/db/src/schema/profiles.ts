import {
  pgTable,
  text,
  integer,
  real,
  boolean,
  timestamp,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const profilesTable = pgTable("profiles", {
  id: text("id").primaryKey(), // Clerk user ID
  fullName: text("full_name"),
  age: integer("age"),
  gender: text("gender"), // male | female | other | prefer_not_to_say
  heightCm: real("height_cm"),
  weightKg: real("weight_kg"),
  goal: text("goal"), // weight_loss | muscle_gain | maintain | recomposition | strength | endurance
  activityLevel: text("activity_level"), // sedentary | light | moderate | active | very_active
  workoutExperience: text("workout_experience"), // beginner | intermediate | advanced
  medicalConditions: text("medical_conditions"),
  injuries: text("injuries"),
  allergies: text("allergies"),
  // body measurements (cm)
  chestCm: real("chest_cm"),
  waistCm: real("waist_cm"),
  hipsCm: real("hips_cm"),
  armsCm: real("arms_cm"),
  thighsCm: real("thighs_cm"),
  shouldersCm: real("shoulders_cm"),
  dailyCalories: integer("daily_calories"),
  foodPreference: text("food_preference"), // vegetarian | non_vegetarian | vegan | keto | any
  sleepHours: real("sleep_hours"),
  stressLevel: integer("stress_level"), // 1-10
  waterIntakeLiters: real("water_intake_liters"),
  gymAvailability: boolean("gym_availability").default(true),
  equipment: text("equipment"), // barbell | dumbbells | machines | bodyweight | bands | cables
  workoutDaysPerWeek: integer("workout_days_per_week"),
  preferredWorkoutTime: text("preferred_workout_time"), // morning | afternoon | evening | flexible
  onboardingCompleted: boolean("onboarding_completed").default(false),
  isAdmin: boolean("is_admin").notNull().default(false),
  isSuspended: boolean("is_suspended").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const insertProfileSchema = createInsertSchema(profilesTable).omit({
  createdAt: true,
  updatedAt: true,
});
export const updateProfileSchema = insertProfileSchema.partial().omit({ id: true });

export type InsertProfile = z.infer<typeof insertProfileSchema>;
export type UpdateProfile = z.infer<typeof updateProfileSchema>;
export type Profile = typeof profilesTable.$inferSelect;
