import { Router, type IRouter } from "express";
import { getAuth } from "@clerk/express";
import { eq, and, desc, gte, lte, sql } from "drizzle-orm";
import { db, progressLogsTable, prRecordsTable } from "@workspace/db";
import {
  CreateProgressLogBody,
  CreatePrRecordBody,
  ListProgressLogsParams,
  DeleteProgressLogParams,
  DeletePrRecordParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

function requireAuth(req: any, res: any, next: any) {
  const auth = getAuth(req);
  const userId = auth?.sessionClaims?.userId || auth?.userId;
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  req.userId = userId;
  next();
}

// ─── GET /progress ────────────────────────────────────────────────────────────
router.get("/progress", requireAuth, async (req: any, res): Promise<void> => {
  const { from, to, limit } = req.query as Record<string, string | undefined>;

  let query = db
    .select()
    .from(progressLogsTable)
    .where(eq(progressLogsTable.userId, req.userId))
    .orderBy(desc(progressLogsTable.logDate));

  const conditions = [eq(progressLogsTable.userId, req.userId)];
  if (from) conditions.push(gte(progressLogsTable.logDate, from));
  if (to) conditions.push(lte(progressLogsTable.logDate, to));

  const logs = await db
    .select()
    .from(progressLogsTable)
    .where(and(...conditions))
    .orderBy(desc(progressLogsTable.logDate))
    .limit(limit ? parseInt(limit, 10) : 90);

  res.json(logs);
});

// ─── POST /progress ───────────────────────────────────────────────────────────
router.post("/progress", requireAuth, async (req: any, res): Promise<void> => {
  const parsed = CreateProgressLogBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [log] = await db
    .insert(progressLogsTable)
    .values({ ...parsed.data, userId: req.userId })
    .returning();

  res.status(201).json(log);
});

// ─── DELETE /progress/:id ─────────────────────────────────────────────────────
router.delete(
  "/progress/:id",
  requireAuth,
  async (req: any, res): Promise<void> => {
    const params = DeleteProgressLogParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: params.error.message });
      return;
    }

    const [deleted] = await db
      .delete(progressLogsTable)
      .where(
        and(
          eq(progressLogsTable.id, params.data.id),
          eq(progressLogsTable.userId, req.userId),
        ),
      )
      .returning();

    if (!deleted) {
      res.status(404).json({ error: "Log not found" });
      return;
    }

    res.sendStatus(204);
  },
);

// ─── GET /progress/summary ────────────────────────────────────────────────────
router.get(
  "/progress/summary",
  requireAuth,
  async (req: any, res): Promise<void> => {
    const now = new Date();
    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const monthAgo = new Date(now);
    monthAgo.setDate(monthAgo.getDate() - 30);

    const fmt = (d: Date) => d.toISOString().split("T")[0]!;

    const [weeklyLogs, monthlyLogs, allLogs] = await Promise.all([
      db
        .select()
        .from(progressLogsTable)
        .where(
          and(
            eq(progressLogsTable.userId, req.userId),
            gte(progressLogsTable.logDate, fmt(weekAgo)),
          ),
        ),
      db
        .select()
        .from(progressLogsTable)
        .where(
          and(
            eq(progressLogsTable.userId, req.userId),
            gte(progressLogsTable.logDate, fmt(monthAgo)),
          ),
        ),
      db
        .select()
        .from(progressLogsTable)
        .where(eq(progressLogsTable.userId, req.userId))
        .orderBy(desc(progressLogsTable.logDate))
        .limit(365),
    ]);

    function avg(arr: number[]): number | null {
      if (!arr.length) return null;
      return Math.round((arr.reduce((a, b) => a + b, 0) / arr.length) * 10) / 10;
    }

    function summarize(logs: typeof allLogs) {
      const weights = logs.filter((l) => l.weightKg != null).map((l) => l.weightKg!);
      const fat = logs.filter((l) => l.bodyFatPercent != null).map((l) => l.bodyFatPercent!);
      const cals = logs.filter((l) => l.caloriesConsumed != null).map((l) => l.caloriesConsumed!);
      const water = logs.filter((l) => l.waterLiters != null).map((l) => l.waterLiters!);
      const sleep = logs.filter((l) => l.sleepHours != null).map((l) => l.sleepHours!);
      return {
        avgWeightKg: avg(weights),
        avgBodyFatPercent: avg(fat),
        avgCaloriesConsumed: avg(cals),
        avgWaterLiters: avg(water),
        avgSleepHours: avg(sleep),
        workoutCount: logs.filter((l) => l.workoutCompleted).length,
        totalLogs: logs.length,
      };
    }

    // Streak: consecutive days ending today
    const sortedDates = allLogs
      .map((l) => l.logDate)
      .sort()
      .reverse();
    let streak = 0;
    const today = fmt(now);
    const yesterday = fmt(new Date(now.getTime() - 86400000));
    if (sortedDates[0] === today || sortedDates[0] === yesterday) {
      let expected = sortedDates[0]!;
      for (const d of sortedDates) {
        if (d === expected) {
          streak++;
          const prev = new Date(expected);
          prev.setDate(prev.getDate() - 1);
          expected = fmt(prev);
        } else break;
      }
    }

    res.json({
      weekly: summarize(weeklyLogs),
      monthly: summarize(monthlyLogs),
      allTime: summarize(allLogs),
      streak,
      totalLogs: allLogs.length,
    });
  },
);

// ─── GET /progress/prs ────────────────────────────────────────────────────────
router.get(
  "/progress/prs",
  requireAuth,
  async (req: any, res): Promise<void> => {
    const prs = await db
      .select()
      .from(prRecordsTable)
      .where(eq(prRecordsTable.userId, req.userId))
      .orderBy(desc(prRecordsTable.achievedAt));

    res.json(prs);
  },
);

// ─── POST /progress/prs ───────────────────────────────────────────────────────
router.post(
  "/progress/prs",
  requireAuth,
  async (req: any, res): Promise<void> => {
    const parsed = CreatePrRecordBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }

    const [pr] = await db
      .insert(prRecordsTable)
      .values({ ...parsed.data, userId: req.userId })
      .returning();

    res.status(201).json(pr);
  },
);

// ─── DELETE /progress/prs/:id ─────────────────────────────────────────────────
router.delete(
  "/progress/prs/:id",
  requireAuth,
  async (req: any, res): Promise<void> => {
    const params = DeletePrRecordParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: params.error.message });
      return;
    }

    const [deleted] = await db
      .delete(prRecordsTable)
      .where(
        and(
          eq(prRecordsTable.id, params.data.id),
          eq(prRecordsTable.userId, req.userId),
        ),
      )
      .returning();

    if (!deleted) {
      res.status(404).json({ error: "PR not found" });
      return;
    }

    res.sendStatus(204);
  },
);

export default router;
