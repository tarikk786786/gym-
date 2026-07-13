import { Router, type IRouter } from "express";
import { eq, desc, count, gte, sql, and, like, ilike } from "drizzle-orm";
import {
  db,
  profilesTable,
  workoutPlansTable,
  dietPlansTable,
  progressLogsTable,
  prRecordsTable,
  workoutTemplatesTable,
  dietTemplatesTable,
  blogsTable,
  settingsTable,
  contactSubmissionsTable,
  newsletterSubscribersTable,
} from "@workspace/db";
import { adminMiddleware } from "../middlewares/adminMiddleware";
import { z } from "zod";

const router: IRouter = Router();

// ─── Dev-only bootstrap (must be registered BEFORE admin middleware) ───────────
if (process.env.NODE_ENV !== "production") {
  router.post("/admin/seed-admin", async (req, res): Promise<void> => {
    const { userId } = req.body ?? {};
    if (!userId || typeof userId !== "string") {
      res.status(400).json({ error: "userId required" });
      return;
    }
    await db
      .update(profilesTable)
      .set({ isAdmin: true })
      .where(eq(profilesTable.id, userId));
    res.json({ success: true, message: `User ${userId} granted admin role` });
  });
}

// All other admin routes require admin role
router.use("/admin", adminMiddleware as any);

// ─── GET /admin/stats ─────────────────────────────────────────────────────────
router.get("/admin/stats", async (_req, res): Promise<void> => {
  const now = new Date();
  const today = now.toISOString().split("T")[0]!;
  const weekAgo = new Date(now.getTime() - 7 * 86400000).toISOString().split("T")[0]!;

  const [
    [{ totalUsers }],
    [{ totalWorkoutPlans }],
    [{ totalDietPlans }],
    [{ plansToday }],
    [{ plansThisWeek }],
    [{ contactLeads }],
    [{ unreadLeads }],
    [{ newsletterSubscribers }],
    [{ totalBlogs }],
    [{ publishedBlogs }],
    [{ totalWorkoutTemplates }],
    [{ totalDietTemplates }],
  ] = await Promise.all([
    db.select({ totalUsers: count() }).from(profilesTable),
    db.select({ totalWorkoutPlans: count() }).from(workoutPlansTable),
    db.select({ totalDietPlans: count() }).from(dietPlansTable),
    db
      .select({ plansToday: count() })
      .from(workoutPlansTable)
      .where(sql`DATE(${workoutPlansTable.createdAt}) = ${today}`),
    db
      .select({ plansThisWeek: count() })
      .from(workoutPlansTable)
      .where(gte(workoutPlansTable.createdAt, new Date(weekAgo))),
    db.select({ contactLeads: count() }).from(contactSubmissionsTable),
    db
      .select({ unreadLeads: count() })
      .from(contactSubmissionsTable)
      .where(eq(contactSubmissionsTable.isRead, false)),
    db.select({ newsletterSubscribers: count() }).from(newsletterSubscribersTable),
    db.select({ totalBlogs: count() }).from(blogsTable),
    db
      .select({ publishedBlogs: count() })
      .from(blogsTable)
      .where(eq(blogsTable.published, true)),
    db.select({ totalWorkoutTemplates: count() }).from(workoutTemplatesTable),
    db.select({ totalDietTemplates: count() }).from(dietTemplatesTable),
  ]);

  res.json({
    totalUsers,
    totalWorkoutPlans,
    totalDietPlans,
    plansToday,
    plansThisWeek,
    contactLeads,
    unreadLeads,
    newsletterSubscribers,
    totalBlogs,
    publishedBlogs,
    totalWorkoutTemplates,
    totalDietTemplates,
  });
});

// ─── GET /admin/users ─────────────────────────────────────────────────────────
router.get("/admin/users", async (req, res): Promise<void> => {
  const { search, page = "1", limit = "20" } = req.query as Record<string, string>;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  let query = db
    .select()
    .from(profilesTable)
    .orderBy(desc(profilesTable.createdAt))
    .limit(parseInt(limit))
    .offset(offset);

  const users = await query;

  const [[{ total }]] = await Promise.all([
    db.select({ total: count() }).from(profilesTable),
  ]);

  res.json({ users, total, page: parseInt(page), limit: parseInt(limit) });
});

// ─── PATCH /admin/users/:id ───────────────────────────────────────────────────
router.patch("/admin/users/:id", async (req, res): Promise<void> => {
  const { id } = req.params;
  const schema = z.object({
    isSuspended: z.boolean().optional(),
    isAdmin: z.boolean().optional(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [updated] = await db
    .update(profilesTable)
    .set(parsed.data)
    .where(eq(profilesTable.id, id))
    .returning();

  if (!updated) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  res.json(updated);
});

// ─── GET /admin/leads ─────────────────────────────────────────────────────────
router.get("/admin/leads", async (req, res): Promise<void> => {
  const { type, page = "1", limit = "20" } = req.query as Record<string, string>;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  const conditions = type ? [eq(contactSubmissionsTable.type, type)] : [];

  const leads = await db
    .select()
    .from(contactSubmissionsTable)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(contactSubmissionsTable.createdAt))
    .limit(parseInt(limit))
    .offset(offset);

  const [[{ total }]] = await Promise.all([
    db.select({ total: count() }).from(contactSubmissionsTable),
  ]);

  res.json({ leads, total });
});

// ─── PATCH /admin/leads/:id ───────────────────────────────────────────────────
router.patch("/admin/leads/:id", async (req, res): Promise<void> => {
  const { id } = req.params;
  const [updated] = await db
    .update(contactSubmissionsTable)
    .set({ isRead: req.body.isRead ?? true })
    .where(eq(contactSubmissionsTable.id, id))
    .returning();

  if (!updated) {
    res.status(404).json({ error: "Lead not found" });
    return;
  }

  res.json(updated);
});

// ─── GET /admin/newsletter ────────────────────────────────────────────────────
router.get("/admin/newsletter", async (req, res): Promise<void> => {
  const { format } = req.query as { format?: string };

  const subscribers = await db
    .select()
    .from(newsletterSubscribersTable)
    .where(eq(newsletterSubscribersTable.active, true))
    .orderBy(desc(newsletterSubscribersTable.createdAt));

  if (format === "csv") {
    const csv = [
      "email,name,createdAt",
      ...subscribers.map((s) => `${s.email},${s.name ?? ""},${s.createdAt}`),
    ].join("\n");
    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="newsletter-subscribers.csv"',
    );
    res.send(csv);
    return;
  }

  res.json({ subscribers, total: subscribers.length });
});

// ─── Workout Templates CRUD ───────────────────────────────────────────────────
router.get("/admin/workout-templates", async (_req, res): Promise<void> => {
  const templates = await db
    .select()
    .from(workoutTemplatesTable)
    .orderBy(desc(workoutTemplatesTable.createdAt));
  res.json(templates);
});

router.post("/admin/workout-templates", async (req: any, res): Promise<void> => {
  const { title, description, goal, experience, split, daysPerWeek, location, plan } = req.body;
  if (!title || !goal || !plan) {
    res.status(400).json({ error: "title, goal, and plan are required" });
    return;
  }
  const [template] = await db
    .insert(workoutTemplatesTable)
    .values({ title, description, goal, experience, split, daysPerWeek, location, plan, createdBy: req.userId })
    .returning();
  res.status(201).json(template);
});

router.put("/admin/workout-templates/:id", async (req, res): Promise<void> => {
  const { id } = req.params;
  const [updated] = await db
    .update(workoutTemplatesTable)
    .set(req.body)
    .where(eq(workoutTemplatesTable.id, id))
    .returning();
  if (!updated) { res.status(404).json({ error: "Not found" }); return; }
  res.json(updated);
});

router.delete("/admin/workout-templates/:id", async (req, res): Promise<void> => {
  await db.delete(workoutTemplatesTable).where(eq(workoutTemplatesTable.id, req.params.id));
  res.sendStatus(204);
});

// ─── Diet Templates CRUD ──────────────────────────────────────────────────────
router.get("/admin/diet-templates", async (_req, res): Promise<void> => {
  const templates = await db
    .select()
    .from(dietTemplatesTable)
    .orderBy(desc(dietTemplatesTable.createdAt));
  res.json(templates);
});

router.post("/admin/diet-templates", async (req: any, res): Promise<void> => {
  const { title, description, cuisine, calorieTarget, dietStyle, allergies, plan } = req.body;
  if (!title || !cuisine || !plan) {
    res.status(400).json({ error: "title, cuisine, and plan are required" });
    return;
  }
  const [template] = await db
    .insert(dietTemplatesTable)
    .values({ title, description, cuisine, calorieTarget, dietStyle, allergies, plan, createdBy: req.userId })
    .returning();
  res.status(201).json(template);
});

router.put("/admin/diet-templates/:id", async (req, res): Promise<void> => {
  const { id } = req.params;
  const [updated] = await db
    .update(dietTemplatesTable)
    .set(req.body)
    .where(eq(dietTemplatesTable.id, id))
    .returning();
  if (!updated) { res.status(404).json({ error: "Not found" }); return; }
  res.json(updated);
});

router.delete("/admin/diet-templates/:id", async (req, res): Promise<void> => {
  await db.delete(dietTemplatesTable).where(eq(dietTemplatesTable.id, req.params.id));
  res.sendStatus(204);
});

// ─── Blogs CRUD (admin) ───────────────────────────────────────────────────────
router.get("/admin/blogs", async (_req, res): Promise<void> => {
  const posts = await db.select().from(blogsTable).orderBy(desc(blogsTable.createdAt));
  res.json(posts);
});

router.post("/admin/blogs", async (req: any, res): Promise<void> => {
  const { title, slug, content, excerpt, published, coverImageUrl } = req.body;
  if (!title || !slug || !content) {
    res.status(400).json({ error: "title, slug, and content are required" });
    return;
  }
  const [post] = await db
    .insert(blogsTable)
    .values({ title, slug, content, excerpt, published: published ?? false, authorId: req.userId, coverImageUrl })
    .returning();
  res.status(201).json(post);
});

router.put("/admin/blogs/:id", async (req, res): Promise<void> => {
  const [updated] = await db
    .update(blogsTable)
    .set({ ...req.body, updatedAt: new Date() })
    .where(eq(blogsTable.id, req.params.id))
    .returning();
  if (!updated) { res.status(404).json({ error: "Not found" }); return; }
  res.json(updated);
});

router.delete("/admin/blogs/:id", async (req, res): Promise<void> => {
  await db.delete(blogsTable).where(eq(blogsTable.id, req.params.id));
  res.sendStatus(204);
});

// ─── System Settings ──────────────────────────────────────────────────────────
router.get("/admin/settings", async (_req, res): Promise<void> => {
  const settings = await db.select().from(settingsTable);
  const map = Object.fromEntries(settings.map((s) => [s.key, s.value]));
  res.json(map);
});

router.put("/admin/settings", async (req, res): Promise<void> => {
  const entries = req.body as Record<string, string>;
  if (typeof entries !== "object" || Array.isArray(entries)) {
    res.status(400).json({ error: "Body must be a key-value object" });
    return;
  }
  await Promise.all(
    Object.entries(entries).map(([key, value]) =>
      db
        .insert(settingsTable)
        .values({ key, value })
        .onConflictDoUpdate({ target: settingsTable.key, set: { value } }),
    ),
  );
  res.json({ success: true });
});

// ─── Seed admin endpoint (dev only — removes itself in prod) ──────────────────
if (process.env.NODE_ENV !== "production") {
  router.post("/admin/seed-admin", async (req: any, res): Promise<void> => {
    const { userId } = req.body;
    if (!userId) { res.status(400).json({ error: "userId required" }); return; }
    await db
      .update(profilesTable)
      .set({ isAdmin: true })
      .where(eq(profilesTable.id, userId));
    res.json({ success: true, message: `User ${userId} granted admin role` });
  });
}

export default router;
