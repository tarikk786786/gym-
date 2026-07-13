import { Router, type IRouter } from "express";
import { getAuth } from "@clerk/express";
import { eq, desc } from "drizzle-orm";
import { db, profilesTable, progressLogsTable } from "@workspace/db";
import { ai } from "@workspace/integrations-gemini-ai";

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

// ─── POST /coach/chat  (SSE streaming) ────────────────────────────────────────
router.post("/coach/chat", requireAuth, async (req: any, res): Promise<void> => {
  const { messages } = req.body as {
    messages: Array<{ role: "user" | "assistant"; content: string }>;
  };

  if (!Array.isArray(messages) || messages.length === 0) {
    res.status(400).json({ error: "messages array required" });
    return;
  }

  // Fetch user profile + last 7 days logs for context
  const [profile, recentLogs] = await Promise.all([
    db
      .select()
      .from(profilesTable)
      .where(eq(profilesTable.id, req.userId))
      .limit(1)
      .then((r) => r[0] ?? null),
    db
      .select()
      .from(progressLogsTable)
      .where(eq(progressLogsTable.userId, req.userId))
      .orderBy(desc(progressLogsTable.logDate))
      .limit(7),
  ]);

  const profileCtx = profile
    ? `User profile:
- Name: ${profile.fullName || "not set"}
- Age: ${profile.age ?? "unknown"}, Gender: ${profile.gender ?? "unknown"}
- Height: ${profile.heightCm ? profile.heightCm + " cm" : "unknown"}, Weight: ${profile.weightKg ? profile.weightKg + " kg" : "unknown"}
- Goal: ${profile.goal ?? "not set"}, Activity level: ${profile.activityLevel ?? "not set"}
- Experience: ${profile.workoutExperience ?? "not set"}
- Medical conditions: ${profile.medicalConditions || "none"}, Injuries: ${profile.injuries || "none"}
- Allergies: ${profile.allergies || "none"}
- Diet preference: ${profile.foodPreference || "not set"}
- Gym available: ${profile.gymAvailability ? "yes" : "no"}, Equipment: ${profile.equipment || "not specified"}
- Workout days/week: ${profile.workoutDaysPerWeek ?? "not set"}`
    : "User profile: not completed yet";

  const logsCtx =
    recentLogs.length > 0
      ? `Recent progress (last ${recentLogs.length} entries):
${recentLogs
  .map(
    (l) =>
      `${l.logDate}: weight=${l.weightKg ?? "—"}kg, calories=${l.caloriesConsumed ?? "—"}, water=${l.waterLiters ?? "—"}L, sleep=${l.sleepHours ?? "—"}h, workout=${l.workoutCompleted ? "yes" : "no"}, mood=${l.mood ?? "—"}`,
  )
  .join("\n")}`
      : "Recent progress: no entries yet";

  const systemPrompt = `You are Tarik Islam's elite AI fitness coach — an expert in strength training, nutrition, body recomposition, recovery, and sports psychology. You are knowledgeable, direct, motivating, and evidence-based.

${profileCtx}

${logsCtx}

Guidelines:
- Give concise, actionable advice personalised to the user's profile and recent data
- Format workout tables with markdown (pipe tables) when giving exercise plans
- Detect plateaus, overtraining signs, or concerning patterns in the progress data
- Provide science-backed recommendations
- Keep responses focused — avoid unnecessary padding
- If the user seems unmotivated, be encouraging but realistic
- Never recommend anything that could worsen stated injuries or medical conditions`;

  // Build Gemini conversation history
  const contents = messages.map((m) => ({
    role: m.role === "assistant" ? ("model" as const) : ("user" as const),
    parts: [{ text: m.content }],
  }));

  // SSE setup
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders();

  try {
    const stream = await ai.models.generateContentStream({
      model: "gemini-2.5-flash",
      contents,
      config: {
        systemInstruction: systemPrompt,
        maxOutputTokens: 2048,
      },
    });

    for await (const chunk of stream) {
      const text = chunk.text;
      if (text) {
        res.write(`data: ${JSON.stringify({ text })}\n\n`);
      }
    }

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (err: any) {
    res.write(`data: ${JSON.stringify({ error: err?.message ?? "AI error" })}\n\n`);
    res.end();
  }
});

export default router;
