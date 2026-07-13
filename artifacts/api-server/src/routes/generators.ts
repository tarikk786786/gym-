import { Router, type IRouter } from "express";
import { getAuth } from "@clerk/express";
import { eq, and, desc } from "drizzle-orm";
import { z } from "zod";
import { db, workoutPlansTable, dietPlansTable } from "@workspace/db";
import { ai } from "@workspace/integrations-gemini-ai";
import {
  GenerateWorkoutPlanBody,
  GenerateDietPlanBody,
  DeleteWorkoutPlanParams,
  DeleteDietPlanParams,
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

// ─── Zod schemas for AI output validation ────────────────────────────────────

const WorkoutExerciseSchema = z.object({
  name: z.string(),
  primaryMuscles: z.array(z.string()),
  secondaryMuscles: z.array(z.string()),
  sets: z.number().int(),
  reps: z.string(),
  rest: z.string(),
  tempo: z.string(),
  rpe: z.number().int().min(1).max(10),
  tips: z.string(),
  commonMistakes: z.string(),
});

const WorkoutDaySchema = z.object({
  day: z.string(),
  sessionName: z.string(),
  targetMuscles: z.string(),
  estimatedDurationMin: z.number().int(),
  warmup: z.string(),
  cooldown: z.string(),
  exercises: z.array(WorkoutExerciseSchema).min(1),
});

const WorkoutPlanDataSchema = z.object({
  programName: z.string(),
  duration: z.string(),
  overview: z.string(),
  weeklySchedule: z.array(WorkoutDaySchema).min(1),
  progressionNotes: z.string(),
});

const DietMacrosSchema = z.object({
  proteinG: z.number(),
  carbsG: z.number(),
  fatG: z.number(),
  fiberG: z.number(),
  sugarG: z.number(),
});

const DietMealSchema = z.object({
  name: z.string(),
  time: z.string(),
  items: z.array(z.string()).min(1),
  calories: z.number().int(),
  proteinG: z.number(),
  carbsG: z.number(),
  fatG: z.number(),
  fiberG: z.number(),
});

const DietPlanDataSchema = z.object({
  dailyCalorieTarget: z.number().int(),
  macros: DietMacrosSchema,
  meals: z.array(DietMealSchema).min(1),
  shoppingList: z.array(z.string()),
  estimatedWeeklyBudgetUSD: z.number(),
  nutritionTips: z.string(),
});

// ─── POST /workout/generate ───────────────────────────────────────────────────
router.post(
  "/workout/generate",
  requireAuth,
  async (req: any, res): Promise<void> => {
    const parsed = GenerateWorkoutPlanBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }

    const { goal, experience, split, daysPerWeek, location, additionalNotes } =
      parsed.data;

    const prompt = `You are an expert personal trainer. Generate a comprehensive weekly workout plan as valid JSON.

User profile:
- Goal: ${goal}
- Experience: ${experience}
- Split: ${split}
- Days per week: ${daysPerWeek}
- Location: ${location}
${additionalNotes ? `- Notes: ${additionalNotes}` : ""}

Return ONLY valid JSON matching this exact structure:
{
  "programName": "string",
  "duration": "string (e.g. '4 weeks')",
  "overview": "string (2-3 sentences about the program)",
  "weeklySchedule": [
    {
      "day": "string (e.g. 'Monday')",
      "sessionName": "string (e.g. 'Push Day')",
      "targetMuscles": "string (comma-separated)",
      "estimatedDurationMin": number,
      "warmup": "string (3-5 specific warmup exercises)",
      "cooldown": "string (3-5 specific cooldown/stretches)",
      "exercises": [
        {
          "name": "string",
          "primaryMuscles": ["string"],
          "secondaryMuscles": ["string"],
          "sets": number,
          "reps": "string (e.g. '8-12' or '5')",
          "rest": "string (e.g. '90 sec')",
          "tempo": "string (e.g. '2-1-2-0')",
          "rpe": number (1-10),
          "tips": "string (technique cue)",
          "commonMistakes": "string"
        }
      ]
    }
  ],
  "progressionNotes": "string (how to progress week by week)"
}

Include exactly ${daysPerWeek} training days. Each day must have 4-7 exercises appropriate for ${location} training. Return ONLY the JSON, no markdown.`;

    let planData: z.infer<typeof WorkoutPlanDataSchema>;

    // Attempt generation with one retry on schema mismatch
    for (let attempt = 1; attempt <= 2; attempt++) {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: { maxOutputTokens: 8192, responseMimeType: "application/json" },
      });

      const rawText = response.text ?? "{}";
      let raw: unknown;
      try {
        raw = JSON.parse(rawText);
      } catch {
        if (attempt === 2) {
          res.status(502).json({ error: "AI returned malformed JSON" });
          return;
        }
        continue;
      }

      const validated = WorkoutPlanDataSchema.safeParse(raw);
      if (validated.success) {
        planData = validated.data;
        break;
      }

      if (attempt === 2) {
        res.status(502).json({
          error: `AI response did not match expected plan structure: ${validated.error.issues[0]?.message ?? "unknown"}`,
        });
        return;
      }
    }

    const [saved] = await db
      .insert(workoutPlansTable)
      .values({
        userId: req.userId,
        goal,
        experience,
        split,
        daysPerWeek,
        location,
        additionalNotes: additionalNotes ?? null,
        plan: planData!,
      })
      .returning();

    res.json(saved);
  },
);

// ─── POST /diet/generate ──────────────────────────────────────────────────────
router.post(
  "/diet/generate",
  requireAuth,
  async (req: any, res): Promise<void> => {
    const parsed = GenerateDietPlanBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }

    const { cuisine, calorieTarget, dietStyle, allergies } = parsed.data;

    const prompt = `You are a certified nutritionist. Generate a complete daily meal plan as valid JSON.

Requirements:
- Cuisine style: ${cuisine}
- Daily calorie target: ${calorieTarget} kcal
- Diet style: ${dietStyle}
${allergies ? `- Allergies/restrictions: ${allergies}` : ""}

Return ONLY valid JSON matching this exact structure:
{
  "dailyCalorieTarget": number,
  "macros": {
    "proteinG": number,
    "carbsG": number,
    "fatG": number,
    "fiberG": number,
    "sugarG": number
  },
  "meals": [
    {
      "name": "string (e.g. 'Breakfast', 'Mid-Morning Snack', 'Lunch', 'Pre-Workout', 'Dinner', 'Before Sleep')",
      "time": "string (e.g. '7:00 AM')",
      "items": ["string (specific food + quantity)"],
      "calories": number,
      "proteinG": number,
      "carbsG": number,
      "fatG": number,
      "fiberG": number
    }
  ],
  "shoppingList": ["string (ingredient + quantity for the week)"],
  "estimatedWeeklyBudgetUSD": number,
  "nutritionTips": "string (3-4 personalized tips)"
}

Include 5-6 meals. Ensure total calories equals ${calorieTarget}. Return ONLY the JSON, no markdown.`;

    let planData: z.infer<typeof DietPlanDataSchema>;

    for (let attempt = 1; attempt <= 2; attempt++) {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: { maxOutputTokens: 8192, responseMimeType: "application/json" },
      });

      const rawText = response.text ?? "{}";
      let raw: unknown;
      try {
        raw = JSON.parse(rawText);
      } catch {
        if (attempt === 2) {
          res.status(502).json({ error: "AI returned malformed JSON" });
          return;
        }
        continue;
      }

      const validated = DietPlanDataSchema.safeParse(raw);
      if (validated.success) {
        planData = validated.data;
        break;
      }

      if (attempt === 2) {
        res.status(502).json({
          error: `AI response did not match expected plan structure: ${validated.error.issues[0]?.message ?? "unknown"}`,
        });
        return;
      }
    }

    const [saved] = await db
      .insert(dietPlansTable)
      .values({
        userId: req.userId,
        cuisine,
        calorieTarget,
        dietStyle,
        allergies: allergies ?? null,
        plan: planData!,
      })
      .returning();

    res.json(saved);
  },
);

// ─── GET /plans ───────────────────────────────────────────────────────────────
router.get("/plans", requireAuth, async (req: any, res): Promise<void> => {
  const [workoutPlans, dietPlans] = await Promise.all([
    db
      .select()
      .from(workoutPlansTable)
      .where(eq(workoutPlansTable.userId, req.userId))
      .orderBy(desc(workoutPlansTable.createdAt))
      .limit(20),
    db
      .select()
      .from(dietPlansTable)
      .where(eq(dietPlansTable.userId, req.userId))
      .orderBy(desc(dietPlansTable.createdAt))
      .limit(20),
  ]);

  res.json({ workoutPlans, dietPlans });
});

// ─── DELETE /plans/workout/:id ────────────────────────────────────────────────
router.delete(
  "/plans/workout/:id",
  requireAuth,
  async (req: any, res): Promise<void> => {
    const params = DeleteWorkoutPlanParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: params.error.message });
      return;
    }

    const [deleted] = await db
      .delete(workoutPlansTable)
      .where(
        and(
          eq(workoutPlansTable.id, params.data.id),
          eq(workoutPlansTable.userId, req.userId),
        ),
      )
      .returning();

    if (!deleted) {
      res.status(404).json({ error: "Plan not found" });
      return;
    }

    res.sendStatus(204);
  },
);

// ─── DELETE /plans/diet/:id ───────────────────────────────────────────────────
router.delete(
  "/plans/diet/:id",
  requireAuth,
  async (req: any, res): Promise<void> => {
    const params = DeleteDietPlanParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: params.error.message });
      return;
    }

    const [deleted] = await db
      .delete(dietPlansTable)
      .where(
        and(
          eq(dietPlansTable.id, params.data.id),
          eq(dietPlansTable.userId, req.userId),
        ),
      )
      .returning();

    if (!deleted) {
      res.status(404).json({ error: "Plan not found" });
      return;
    }

    res.sendStatus(204);
  },
);

export default router;
