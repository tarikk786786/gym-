import {
  pgTable,
  text,
  integer,
  real,
  boolean,
  timestamp,
  jsonb,
  unique,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

// ─── Workout Templates (admin-created) ───────────────────────────────────────

export const workoutTemplatesTable = pgTable("workout_templates", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  title: text("title").notNull(),
  description: text("description"),
  goal: text("goal").notNull(),
  experience: text("experience").notNull(),
  split: text("split").notNull(),
  daysPerWeek: integer("days_per_week").notNull(),
  location: text("location").notNull(),
  plan: jsonb("plan").notNull(),
  createdBy: text("created_by").notNull(), // admin userId
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const insertWorkoutTemplateSchema = createInsertSchema(workoutTemplatesTable).omit({
  createdAt: true,
  updatedAt: true,
});
export type InsertWorkoutTemplate = z.infer<typeof insertWorkoutTemplateSchema>;
export type WorkoutTemplate = typeof workoutTemplatesTable.$inferSelect;

// ─── Diet Templates (admin-created) ──────────────────────────────────────────

export const dietTemplatesTable = pgTable("diet_templates", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  title: text("title").notNull(),
  description: text("description"),
  cuisine: text("cuisine").notNull(),
  calorieTarget: integer("calorie_target").notNull(),
  dietStyle: text("diet_style").notNull(),
  allergies: text("allergies"),
  plan: jsonb("plan").notNull(),
  createdBy: text("created_by").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const insertDietTemplateSchema = createInsertSchema(dietTemplatesTable).omit({
  createdAt: true,
  updatedAt: true,
});
export type InsertDietTemplate = z.infer<typeof insertDietTemplateSchema>;
export type DietTemplate = typeof dietTemplatesTable.$inferSelect;

// ─── Blogs ────────────────────────────────────────────────────────────────────

export const blogsTable = pgTable("blogs", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  content: text("content").notNull(),
  excerpt: text("excerpt"),
  published: boolean("published").notNull().default(false),
  authorId: text("author_id").notNull(),
  coverImageUrl: text("cover_image_url"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const insertBlogSchema = createInsertSchema(blogsTable).omit({
  createdAt: true,
  updatedAt: true,
});
export type InsertBlog = z.infer<typeof insertBlogSchema>;
export type Blog = typeof blogsTable.$inferSelect;

// ─── System Settings ──────────────────────────────────────────────────────────

export const settingsTable = pgTable("settings", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const insertSettingSchema = createInsertSchema(settingsTable).omit({
  updatedAt: true,
});
export type InsertSetting = z.infer<typeof insertSettingSchema>;
export type Setting = typeof settingsTable.$inferSelect;

// ─── Contact Submissions (already exists via contact route, adding table) ─────

export const contactSubmissionsTable = pgTable("contact_submissions", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  email: text("email").notNull(),
  subject: text("subject"),
  message: text("message").notNull(),
  type: text("type").notNull().default("contact"), // contact | newsletter
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertContactSubmissionSchema = createInsertSchema(contactSubmissionsTable).omit({
  createdAt: true,
});
export type InsertContactSubmission = z.infer<typeof insertContactSubmissionSchema>;
export type ContactSubmission = typeof contactSubmissionsTable.$inferSelect;

// ─── Newsletter Subscribers ───────────────────────────────────────────────────

export const newsletterSubscribersTable = pgTable("newsletter_subscribers", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  email: text("email").notNull().unique(),
  name: text("name"),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertNewsletterSubscriberSchema = createInsertSchema(newsletterSubscribersTable).omit({
  createdAt: true,
});
export type InsertNewsletterSubscriber = z.infer<typeof insertNewsletterSubscriberSchema>;
export type NewsletterSubscriber = typeof newsletterSubscribersTable.$inferSelect;
