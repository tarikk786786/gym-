import { Router } from "express";
// pdfkit loaded lazily so the serverless cold-start doesn't require it at module load time
type PDFDocumentType = typeof import("pdfkit").default;

// ─── NVIDIA NIM helper (OpenAI-compatible) ────────────────────────────────────
async function callGemini(prompt: string): Promise<string> {
  const apiKey = process.env.NVIDIA_API_KEY;
  if (!apiKey) throw new Error("NVIDIA_API_KEY is not set.");

  const resp = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "meta/llama-3.1-8b-instruct",
      messages: [
        {
          role: "system",
          content: "You are an elite certified personal trainer and sports nutritionist. Always respond with valid JSON only — no markdown, no code fences, no extra text.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.4,
      max_tokens: 16384,
      stream: false,
    }),
  });

  if (!resp.ok) {
    const err = await resp.text().catch(() => resp.statusText);
    throw new Error(`NVIDIA API error ${resp.status}: ${err}`);
  }

  const data = await resp.json() as { choices: Array<{ message: { content: string } }> };
  return data.choices[0]?.message?.content ?? "";
}

const router = Router();

// ─── Types ────────────────────────────────────────────────────────────────────
interface Exercise {
  name: string; sets: number; reps: string; rest: string; tips: string; tempo?: string;
}
interface WorkoutDay {
  day: string; focus: string; duration: string; intensity: string;
  warmup: string[]; exercises: Exercise[]; cooldown: string[];
}
interface WeekPlan {
  week: number; weeklyTheme: string; progressionNote: string; days: WorkoutDay[];
}
interface MealItem { name: string; calories: number; protein: number; carbs: number; fat: number; description: string; }
interface DayMeals {
  day: string; totalCalories: number; totalProtein: number; totalCarbs: number; totalFat: number;
  meals: {
    breakfast: MealItem; morningSnack: MealItem; lunch: MealItem;
    afternoonSnack: MealItem; dinner: MealItem;
  };
}
interface Supplement { name: string; dosage: string; timing: string; benefit: string; priority: "essential" | "recommended" | "optional"; }
interface FitnessPlan {
  bmi: number; bmiCategory: string; bmr: number; tdee: number; dailyCalories: number;
  macros: { protein: number; carbs: number; fat: number };
  bodyFatCategory: string; fitnessScore: number; metabolicAge: number;
  weeklyCalorieDeficitOrSurplus: number;
  workoutSchedule: WeekPlan[];
  mealPlan: DayMeals[];
  supplements: Supplement[];
  recoveryProtocol: { sleepRecommendation: string; activeRecoveryTips: string[]; mobilityRoutine: string[]; stressManagement: string[]; };
  progressMilestones: { week4: string; week8: string; week12: string; };
  coachLetter: string;
  warningFlags: string[];
}

// ─── Label maps ───────────────────────────────────────────────────────────────
const GOAL_LABELS: Record<string, string> = {
  weight_loss: "Weight Loss", muscle_gain: "Muscle Gain", maintain: "Maintain Weight",
  recomposition: "Body Recomposition", strength: "Strength & Power", endurance: "Cardiovascular Endurance",
};
const ACTIVITY_LABELS: Record<string, string> = {
  sedentary: "Sedentary", light: "Lightly Active", moderate: "Moderately Active",
  active: "Very Active", very_active: "Extremely Active",
};
const DIET_LABELS: Record<string, string> = {
  any: "No Restrictions", high_protein: "High Protein", vegetarian: "Vegetarian",
  vegan: "Vegan", keto: "Ketogenic", mediterranean: "Mediterranean", paleo: "Paleo",
};

// ─── PDF helpers ──────────────────────────────────────────────────────────────
const GOLD = "#C9A84C";
const DARK = "#0A0A0A";
const DARK2 = "#111111";
const DARK3 = "#1A1A1A";
const DARK4 = "#242424";
const WHITE = "#FFFFFF";
const GREY = "#888888";
const LIGHT = "#CCCCCC";
const FAINT = "#555555";

const PAGE_W = 595.28;
const PAGE_H = 841.89;
const M = 45;
const CW = PAGE_W - M * 2;

function badgeColor(priority: string) {
  if (priority === "essential") return "#C9A84C";
  if (priority === "recommended") return "#4C8BC9";
  return "#4CAF50";
}

router.post("/plan/generate", async (req, res): Promise<void> => {
  const body = req.body ?? {};
  const {
    name, age, gender, heightCm, weightKg, bodyFatPercent, targetWeightKg, timeframeWeeks,
    goal, activityLevel, sleepHours, stressLevel, jobType,
    experience, workoutLocation, daysPerWeek, preferredWorkoutTime, equipment,
    dietStyle, foodPreferences, injuriesOrAllergies, medicalConditions,
  } = body;

  if (!name || !age || !gender || !heightCm || !weightKg || !goal || !activityLevel || !experience || !workoutLocation || !daysPerWeek || !dietStyle) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }

  // ── Build AI prompt ──────────────────────────────────────────────────────
  const prompt = `You are an elite certified personal trainer, sports nutritionist, and physiotherapist with 20+ years of experience. Generate a comprehensive, science-backed, fully personalised fitness and nutrition plan as a single JSON object.

CLIENT PROFILE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Personal: ${name}, ${age} years old, ${gender}
Body: ${heightCm}cm tall, ${weightKg}kg${bodyFatPercent ? `, ${bodyFatPercent}% body fat` : ""}
Target: ${targetWeightKg ? `goal weight ${targetWeightKg}kg` : "no specific target weight"}${timeframeWeeks ? `, timeframe ${timeframeWeeks} weeks` : ""}
Goal: ${GOAL_LABELS[goal] || goal}
Activity Level: ${ACTIVITY_LABELS[activityLevel] || activityLevel}
Lifestyle: ${sleepHours ? `${sleepHours}h sleep` : "sleep unknown"}, ${stressLevel ? `stress ${stressLevel}/5` : "stress unknown"}, ${jobType ? `${jobType} job` : "job type unknown"}
Training: ${experience} level, ${workoutLocation} training, ${daysPerWeek} days/week${preferredWorkoutTime && preferredWorkoutTime !== "any" ? `, prefers ${preferredWorkoutTime} sessions` : ""}
Equipment: ${equipment || (workoutLocation === "home" ? "bodyweight + basic home equipment" : "full gym equipment")}
Diet: ${DIET_LABELS[dietStyle] || dietStyle}${foodPreferences ? `, preferences: ${foodPreferences}` : ""}
Health notes: ${injuriesOrAllergies || "none"} | Medical: ${medicalConditions || "none"}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Return ONLY a valid JSON object (absolutely no markdown, no code blocks, no extra text) with this EXACT structure:

{
  "bmi": <number 1dp>,
  "bmiCategory": "<Underweight|Normal weight|Overweight|Obese class I|Obese class II>",
  "bmr": <integer kcal>,
  "tdee": <integer kcal>,
  "dailyCalories": <integer, adjusted for goal>,
  "macros": { "protein": <grams/day>, "carbs": <grams/day>, "fat": <grams/day> },
  "bodyFatCategory": "<Essential|Athletic|Fitness|Average|Obese>",
  "fitnessScore": <integer 1-100>,
  "metabolicAge": <integer, years>,
  "weeklyCalorieDeficitOrSurplus": <integer, negative=deficit positive=surplus>,
  "workoutSchedule": [
    {
      "week": 1,
      "weeklyTheme": "<e.g. Foundation & Form>",
      "progressionNote": "<how this week differs from previous>",
      "days": [
        {
          "day": "<Monday>",
          "focus": "<e.g. Upper Body Push — Chest, Shoulders, Triceps>",
          "duration": "<e.g. 55 min>",
          "intensity": "<Low|Moderate|High|Very High>",
          "warmup": ["<warmup exercise 1>", "<warmup exercise 2>", "<warmup exercise 3>"],
          "exercises": [
            {
              "name": "<exercise name>",
              "sets": <number>,
              "reps": "<e.g. 8-12 or 45 sec>",
              "rest": "<e.g. 90s>",
              "tempo": "<e.g. 3-1-2-0 or bodyweight>",
              "tips": "<specific form cue>"
            }
          ],
          "cooldown": ["<cooldown stretch 1>", "<cooldown stretch 2>", "<cooldown stretch 3>"]
        }
      ]
    }
  ],
  "mealPlan": [
    {
      "day": "<Monday>",
      "totalCalories": <integer>,
      "totalProtein": <integer grams>,
      "totalCarbs": <integer grams>,
      "totalFat": <integer grams>,
      "meals": {
        "breakfast":      { "name": "<meal>", "calories": <int>, "protein": <int>, "carbs": <int>, "fat": <int>, "description": "<ingredients & prep>" },
        "morningSnack":   { "name": "<snack>", "calories": <int>, "protein": <int>, "carbs": <int>, "fat": <int>, "description": "<ingredients>" },
        "lunch":          { "name": "<meal>", "calories": <int>, "protein": <int>, "carbs": <int>, "fat": <int>, "description": "<ingredients & prep>" },
        "afternoonSnack": { "name": "<snack>", "calories": <int>, "protein": <int>, "carbs": <int>, "fat": <int>, "description": "<ingredients>" },
        "dinner":         { "name": "<meal>", "calories": <int>, "protein": <int>, "carbs": <int>, "fat": <int>, "description": "<ingredients & prep>" }
      }
    }
  ],
  "supplements": [
    { "name": "<supplement>", "dosage": "<amount>", "timing": "<when exactly>", "benefit": "<why for this client>", "priority": "<essential|recommended|optional>" }
  ],
  "recoveryProtocol": {
    "sleepRecommendation": "<specific advice for this client>",
    "activeRecoveryTips": ["<tip 1>", "<tip 2>", "<tip 3>", "<tip 4>"],
    "mobilityRoutine": ["<stretch/mobility move 1>", "<stretch/mobility move 2>", "<stretch/mobility move 3>", "<stretch/mobility move 4>", "<stretch/mobility move 5>"],
    "stressManagement": ["<technique 1>", "<technique 2>", "<technique 3>"]
  },
  "progressMilestones": {
    "week4": "<what client should expect by week 4>",
    "week8": "<what client should expect by week 8>",
    "week12": "<what client should expect by week 12>"
  },
  "coachLetter": "<2-3 paragraph personalised motivational letter from Coach Tarik Islam directly addressing the client by first name, referencing their specific goal, acknowledging any challenges/injuries, and providing encouragement>",
  "warningFlags": ["<any safety note or medical flag if relevant, empty array if none>"]
}

CRITICAL RULES:
- workoutSchedule MUST have exactly 4 weeks
- Each week MUST have exactly ${daysPerWeek} workout days (no rest days in the array)
- Week 2 must increase volume or intensity vs week 1 (progressive overload)
- Week 3 increases further; week 4 can be a deload or peak
- mealPlan MUST have exactly 7 days (Monday–Sunday)
- All exercises MUST suit ${workoutLocation === "both" ? "gym and home environments" : workoutLocation === "home" ? "home training (bodyweight + " + (equipment || "minimal equipment") + ")" : "full gym equipment"}
- Diet MUST comply with: ${DIET_LABELS[dietStyle] || dietStyle}${foodPreferences ? ` and incorporate: ${foodPreferences}` : ""}
- ${injuriesOrAllergies ? `AVOID anything that could aggravate: ${injuriesOrAllergies}` : "No injury restrictions"}
- ${medicalConditions ? `Account for medical conditions: ${medicalConditions}` : "No medical conditions"}
- Calorie and macro totals must be mathematically consistent (protein 4kcal/g, carbs 4kcal/g, fat 9kcal/g)
- supplements list should have 4-7 items
- coachLetter must mention the client's name and reference their specific goal and timeframe`;

  // ── Zod schema for critical PDF-rendering fields ─────────────────────────
  const { z } = await import("zod");
  const exerciseSchema = z.object({
    name: z.string(), sets: z.number(), reps: z.string(), rest: z.string(), tips: z.string(),
    tempo: z.string().optional(),
  });
  const workoutDaySchema = z.object({
    day: z.string(), focus: z.string(), duration: z.string(), intensity: z.string(),
    warmup: z.array(z.string()).default([]),
    exercises: z.array(exerciseSchema),
    cooldown: z.array(z.string()).default([]),
  });
  const mealItemSchema = z.object({
    name: z.string(), calories: z.number(), protein: z.number(), carbs: z.number(), fat: z.number(),
    description: z.string(),
  });
  const planSchema = z.object({
    bmi: z.number(), bmiCategory: z.string(), bmr: z.number(), tdee: z.number(),
    dailyCalories: z.number(), macros: z.object({ protein: z.number(), carbs: z.number(), fat: z.number() }),
    bodyFatCategory: z.string().default("Unknown"), fitnessScore: z.number().int(),
    metabolicAge: z.number().default(0), weeklyCalorieDeficitOrSurplus: z.number().default(0),
    workoutSchedule: z.array(z.object({
      week: z.number(), weeklyTheme: z.string().default(""),
      progressionNote: z.string().default(""),
      days: z.array(workoutDaySchema).min(1),
    })).min(1),
    mealPlan: z.array(z.object({
      day: z.string(), totalCalories: z.number(),
      totalProtein: z.number().default(0), totalCarbs: z.number().default(0), totalFat: z.number().default(0),
      meals: z.object({
        breakfast: mealItemSchema, morningSnack: mealItemSchema, lunch: mealItemSchema,
        afternoonSnack: mealItemSchema, dinner: mealItemSchema,
      }),
    })).min(1),
    supplements: z.array(z.object({
      name: z.string(), dosage: z.string(), timing: z.string(), benefit: z.string(),
      priority: z.enum(["essential", "recommended", "optional"]).default("recommended"),
    })),
    recoveryProtocol: z.object({
      sleepRecommendation: z.string().default(""),
      activeRecoveryTips: z.array(z.string()).default([]),
      mobilityRoutine: z.array(z.string()).default([]),
      stressManagement: z.array(z.string()).default([]),
    }),
    progressMilestones: z.object({
      week4: z.string().default(""), week8: z.string().default(""), week12: z.string().default(""),
    }),
    coachLetter: z.string().default(""),
    warningFlags: z.array(z.string()).default([]),
  });

  const parseAndValidate = (raw: string): FitnessPlan => {
    const cleaned = raw.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "").trim();
    const parsed = JSON.parse(cleaned);
    return planSchema.parse(parsed) as FitnessPlan;
  };

  let plan: FitnessPlan;
  try {
    req.log.info({ name, goal, experience }, "Generating AI fitness plan via Gemini");
    let raw = await callGemini(prompt);
    try {
      plan = parseAndValidate(raw);
    } catch (validationErr) {
      // Retry once on validation failure
      req.log.warn({ validationErr }, "Plan validation failed, retrying once");
      raw = await callGemini(prompt);
      plan = parseAndValidate(raw);
    }
  } catch (err) {
    req.log.error({ err }, "Failed to generate AI plan");
    res.status(500).json({ error: "Failed to generate plan. Please try again in a moment." });
    return;
  }

  // ── Build PDF ────────────────────────────────────────────────────────────
  try {
    // Dynamic import so the module loads on first PDF request, not at startup
    const PDFDocument = (await import("pdfkit")).default as unknown as new (...a: ConstructorParameters<PDFDocumentType>) => InstanceType<PDFDocumentType>;
    const doc = new PDFDocument({ margin: M, size: "A4", bufferPages: true, autoFirstPage: true });
    const buffers: Buffer[] = [];
    doc.on("data", (c: Buffer) => buffers.push(c));

    // ── Utility functions ────────────────────────────────────────────────
    const newPage = () => { doc.addPage(); doc.rect(0, 0, PAGE_W, PAGE_H).fill(DARK); rect(0, 0, 5, PAGE_H, GOLD); };
    const rect = (x: number, y: number, w: number, h: number, color: string) => doc.rect(x, y, w, h).fill(color);
    const text = (str: string, x: number, y: number, opts?: object, color = LIGHT, size = 9, font = "Helvetica") => {
      doc.fillColor(color).fontSize(size).font(font).text(str, x, y, opts ?? {});
    };
    const bold = (str: string, x: number, y: number, opts?: object, color = WHITE, size = 9) =>
      text(str, x, y, opts, color, size, "Helvetica-Bold");

    const sectionHeader = (title: string, y: number, icon = "") => {
      rect(M, y, CW, 28, DARK3); rect(M, y, 4, 28, GOLD);
      bold(`${icon}${icon ? "  " : ""}${title}`, M + 14, y + 8, {}, GOLD, 11);
      return y + 38;
    };

    const footer = (page: number, total: number) => {
      doc.save();
      rect(0, PAGE_H - 36, PAGE_W, 36, "#080808");
      text("Tarik Islam AI Gym Planner  ·  tarikislam.in", M, PAGE_H - 23, { align: "left", width: CW / 2 }, FAINT, 7);
      text(`Page ${page} / ${total}`, M, PAGE_H - 23, { align: "right", width: CW }, FAINT, 7);
      doc.restore();
    };

    const usableH = PAGE_H - M - 50; // usable height before footer
    const checkY = (y: number, needed = 60) => { if (y + needed > usableH) { newPage(); return M + 10; } return y; };

    // ════════════════════════════════════════════════════════════════════════
    // PAGE 1 — COVER
    // ════════════════════════════════════════════════════════════════════════
    doc.rect(0, 0, PAGE_W, PAGE_H).fill(DARK);
    rect(0, 0, 5, PAGE_H, GOLD);

    // Top banner
    rect(0, 0, PAGE_W, 80, "#0D0D0D");
    bold("TARIK ISLAM", M + 10, 20, {}, GOLD, 14);
    text("AI GYM PLANNER  ·  tarikislam.in", M + 10, 38, {}, GREY, 9);
    text("Personal Training Plan", M + 10, 54, {}, FAINT, 8);

    // Hero text
    bold("PERSONALISED", M, 120, { align: "center", width: CW }, GOLD, 10);
    bold("FITNESS PLAN", M, 138, { align: "center", width: CW }, WHITE, 38);

    const firstName = (name as string).split(" ")[0];
    bold(`FOR: ${(name as string).toUpperCase()}`, M, 190, { align: "center", width: CW }, LIGHT, 14);
    text(GOAL_LABELS[goal] || goal, M, 212, { align: "center", width: CW }, GREY, 11);

    // Divider
    rect(M + 60, 235, CW - 120, 1, GOLD);

    // Stats boxes
    const dateStr = new Date().toLocaleDateString("en-GB", { year: "numeric", month: "long", day: "numeric" });
    const boxes = [
      { l: "BMI", v: plan.bmi.toFixed(1), s: plan.bmiCategory },
      { l: "DAILY TARGET", v: `${plan.dailyCalories.toLocaleString()}`, s: "kcal / day" },
      { l: "PROTEIN", v: `${plan.macros.protein}g`, s: "per day" },
      { l: "FITNESS SCORE", v: `${plan.fitnessScore}`, s: "out of 100" },
    ];
    const bx = M, by = 255, bw = (CW - 15) / 4, bh = 72;
    boxes.forEach((b, i) => {
      const x = bx + i * (bw + 5);
      rect(x, by, bw, bh, DARK3);
      rect(x, by, bw, 3, GOLD);
      text(b.l, x, by + 8, { align: "center", width: bw }, GREY, 7, "Helvetica-Bold");
      bold(b.v, x, by + 20, { align: "center", width: bw }, WHITE, 16);
      text(b.s, x, by + 46, { align: "center", width: bw }, FAINT, 7);
    });

    // Macros bar
    const by2 = by + bh + 18;
    const total = plan.macros.protein * 4 + plan.macros.carbs * 4 + plan.macros.fat * 9;
    const pPct = Math.round((plan.macros.protein * 4 / total) * 100);
    const cPct = Math.round((plan.macros.carbs * 4 / total) * 100);
    const fPct = 100 - pPct - cPct;
    rect(M, by2, CW, 16, DARK3);
    rect(M, by2, CW * pPct / 100, 16, "#C9A84C");
    rect(M + CW * pPct / 100, by2, CW * cPct / 100, 16, "#4C8BC9");
    rect(M + CW * (pPct + cPct) / 100, by2, CW * fPct / 100, 16, "#C94CAF");
    text(`Protein ${pPct}%`, M, by2 + 20, {}, GOLD, 7, "Helvetica-Bold");
    text(`Carbs ${cPct}%`, M + CW / 3, by2 + 20, { align: "center", width: CW / 3 }, "#4C8BC9", 7, "Helvetica-Bold");
    text(`Fat ${fPct}%`, M + (2 * CW) / 3, by2 + 20, { align: "right", width: CW / 3 }, "#C94CAF", 7, "Helvetica-Bold");

    // Coach letter excerpt (first 300 chars)
    const letterSnippet = (plan.coachLetter || "").slice(0, 320) + "…";
    rect(M, by2 + 40, CW, 100, DARK2);
    rect(M, by2 + 40, 4, 100, "#444");
    text(`"${letterSnippet}"`, M + 14, by2 + 52, { width: CW - 24, lineBreak: true }, LIGHT, 8, "Helvetica-Oblique");

    // Included sections
    const included = ["4-Week Progressive Workout Program", "7-Day Personalised Meal Plan (5 meals/day)", "Supplement Protocol", "Recovery & Sleep Guide", "Progress Milestones (4 / 8 / 12 weeks)"];
    const iy = by2 + 152;
    rect(M, iy, CW, 1, "#333");
    text(`Generated on ${dateStr}  ·  Includes:`, M, iy + 8, {}, GREY, 7);
    included.forEach((s, i) => {
      text(`✓  ${s}`, M + (i % 2 === 0 ? 0 : CW / 2 + 10), iy + 20 + Math.floor(i / 2) * 14, {}, LIGHT, 7);
    });

    // Warning flags
    if (plan.warningFlags?.length > 0) {
      const wy = iy + 75;
      rect(M, wy, CW, plan.warningFlags.length * 14 + 16, "#1A0000");
      rect(M, wy, 4, plan.warningFlags.length * 14 + 16, "#FF4444");
      bold("⚠  SAFETY NOTES", M + 14, wy + 6, {}, "#FF6666", 8);
      plan.warningFlags.forEach((f, i) => text(`·  ${f}`, M + 14, wy + 20 + i * 14, { width: CW - 24 }, "#FF9999", 7));
    }

    // ════════════════════════════════════════════════════════════════════════
    // PAGE 2 — CLIENT ASSESSMENT
    // ════════════════════════════════════════════════════════════════════════
    newPage();
    let y = M;
    bold("CLIENT ASSESSMENT", M, y, { align: "center", width: CW }, GOLD, 18);
    y += 32;

    // Two-column metrics
    const col1 = M, col2 = M + CW / 2 + 8, colW = CW / 2 - 8;
    const metricRow = (label: string, value: string, cx: number, cy: number, cw: number, highlight = false) => {
      if (highlight) rect(cx, cy, cw, 22, DARK3);
      text(label, cx + 8, cy + 6, { width: cw / 2 - 8 }, GREY, 8);
      bold(value, cx + cw / 2, cy + 6, { align: "right", width: cw / 2 - 8 }, WHITE, 8);
      return cy + 22;
    };

    // Col 1: Body Metrics
    y = sectionHeader("BODY METRICS", y);
    let y1 = y, y2 = y;
    y1 = metricRow("Height", `${heightCm} cm`, col1, y1, colW, false);
    y1 = metricRow("Weight", `${weightKg} kg`, col1, y1, colW, true);
    y1 = metricRow("BMI", `${plan.bmi.toFixed(1)} — ${plan.bmiCategory}`, col1, y1, colW, false);
    y1 = metricRow("Body Fat Category", plan.bodyFatCategory, col1, y1, colW, true);
    if (bodyFatPercent) y1 = metricRow("Body Fat %", `${bodyFatPercent}%`, col1, y1, colW, false);
    if (targetWeightKg) y1 = metricRow("Target Weight", `${targetWeightKg} kg`, col1, y1, colW, true);

    // Col 2: Energy Metrics — draw a mini header at col2 (sectionHeader always spans full width)
    rect(col2, y - 38, colW, 28, DARK3); rect(col2, y - 38, 4, 28, GOLD);
    bold("ENERGY TARGETS", col2 + 14, y - 30, {}, GOLD, 11);
    y2 = y;
    y2 = metricRow("BMR (at rest)", `${plan.bmr.toLocaleString()} kcal`, col2, y2, colW, false);
    y2 = metricRow("TDEE (maintenance)", `${plan.tdee.toLocaleString()} kcal`, col2, y2, colW, true);
    y2 = metricRow("Daily Target", `${plan.dailyCalories.toLocaleString()} kcal`, col2, y2, colW, false);
    y2 = metricRow("Weekly " + (plan.weeklyCalorieDeficitOrSurplus < 0 ? "Deficit" : "Surplus"),
      `${Math.abs(plan.weeklyCalorieDeficitOrSurplus).toLocaleString()} kcal`, col2, y2, colW, true);
    y2 = metricRow("Metabolic Age", `${plan.metabolicAge} years`, col2, y2, colW, false);

    y = Math.max(y1, y2) + 20;

    // Macro targets
    y = checkY(y, 80);
    y = sectionHeader("DAILY MACRONUTRIENT TARGETS", y);
    const macroItems = [
      { l: "Protein", v: plan.macros.protein, unit: "g", kcal: plan.macros.protein * 4, pct: pPct, color: GOLD },
      { l: "Carbohydrates", v: plan.macros.carbs, unit: "g", kcal: plan.macros.carbs * 4, pct: cPct, color: "#4C8BC9" },
      { l: "Fat", v: plan.macros.fat, unit: "g", kcal: plan.macros.fat * 9, pct: fPct, color: "#C94CAF" },
    ];
    macroItems.forEach((m, i) => {
      const mx = M + i * ((CW + 10) / 3), mw = (CW - 20) / 3;
      rect(mx, y, mw, 56, DARK3); rect(mx, y, mw, 3, m.color);
      bold(`${m.v}${m.unit}`, mx, y + 10, { align: "center", width: mw }, WHITE, 18);
      text(m.l, mx, y + 33, { align: "center", width: mw }, GREY, 7, "Helvetica-Bold");
      text(`${m.kcal} kcal  ·  ${m.pct}%`, mx, y + 44, { align: "center", width: mw }, FAINT, 7);
    });
    y += 70;

    // Fitness & Lifestyle
    y = checkY(y, 80);
    y = sectionHeader("FITNESS & LIFESTYLE PROFILE", y);
    const profileRows = [
      ["Fitness Score", `${plan.fitnessScore} / 100`, true],
      ["Training Experience", experience, false],
      ["Activity Level", ACTIVITY_LABELS[activityLevel] || activityLevel, true],
      ["Goal", GOAL_LABELS[goal] || goal, false],
      ["Training Days", `${daysPerWeek} days/week`, true],
      ["Workout Location", workoutLocation, false],
      ...(sleepHours ? [["Sleep", `${sleepHours} hours/night`, true]] as [string, string, boolean][] : []),
      ...(stressLevel ? [["Stress Level", `${stressLevel}/5`, false]] as [string, string, boolean][] : []),
    ];
    profileRows.forEach(([l, v, h]) => {
      rect(M, y, CW, 22, (h as boolean) ? DARK3 : "transparent");
      text(l as string, M + 8, y + 7, { width: CW / 2 - 8 }, GREY, 8);
      bold(v as string, M + CW / 2, y + 7, { align: "right", width: CW / 2 - 8 }, WHITE, 8);
      y += 22;
    });

    // Progress milestones
    y += 10;
    y = checkY(y, 100);
    y = sectionHeader("PROJECTED PROGRESS MILESTONES", y);
    [
      { w: "Week 4", t: plan.progressMilestones.week4, c: GOLD },
      { w: "Week 8", t: plan.progressMilestones.week8, c: "#4C8BC9" },
      { w: "Week 12", t: plan.progressMilestones.week12, c: "#4CAF50" },
    ].forEach(({ w, t, c }) => {
      rect(M, y, 4, 36, c); rect(M + 4, y, CW - 4, 36, DARK2);
      bold(w, M + 14, y + 5, {}, c, 8);
      text(t, M + 14, y + 17, { width: CW - 24 }, LIGHT, 7);
      y += 42;
    });

    // ════════════════════════════════════════════════════════════════════════
    // PAGES 3+ — WORKOUT PROGRAM
    // ════════════════════════════════════════════════════════════════════════
    for (const week of plan.workoutSchedule) {
      newPage();
      y = M;
      bold(`WEEK ${week.week}`, M, y, {}, GOLD, 22);
      bold(week.weeklyTheme, M + 90, y + 8, {}, LIGHT, 11);
      y += 32;

      if (week.progressionNote) {
        rect(M, y, CW, 24, DARK2); rect(M, y, 4, 24, "#4C8BC9");
        text(`📈  ${week.progressionNote}`, M + 12, y + 8, { width: CW - 20 }, "#7ab3e0", 7);
        y += 32;
      }

      for (const day of week.days) {
        y = checkY(y, 80);

        // Day header
        rect(M, y, CW, 32, DARK3); rect(M, y, 4, 32, GOLD);
        bold(day.day.toUpperCase(), M + 14, y + 5, {}, GOLD, 10);
        bold(day.focus, M + 14, y + 17, {}, LIGHT, 8);
        text(`${day.duration}  ·  ${day.intensity} intensity`, PAGE_W - M - 100, y + 5, { align: "right", width: 100 }, GREY, 7);
        y += 38;

        // Warm-up
        if (day.warmup?.length) {
          y = checkY(y, 24);
          rect(M, y, CW, 18, "#0D1A0D");
          text("WARM-UP:  " + day.warmup.join("  ·  "), M + 8, y + 5, { width: CW - 16 }, "#70aa70", 7, "Helvetica-Bold");
          y += 24;
        }

        // Exercise header row
        rect(M, y, CW, 16, DARK4);
        const cols = [M + 8, M + 160, M + 220, M + 268, M + 320];
        ["EXERCISE", "SETS × REPS", "REST", "TEMPO", "FORM TIP"].forEach((h, i) => {
          text(h, cols[i], y + 4, {}, FAINT, 6, "Helvetica-Bold");
        });
        y += 16;

        // Exercises
        day.exercises.forEach((ex, ei) => {
          y = checkY(y, 24);
          if (ei % 2 === 0) rect(M, y, CW, 22, "#0D0D0D");
          bold(`${ei + 1}. ${ex.name}`, cols[0], y + 6, { width: 148 }, WHITE, 8);
          text(`${ex.sets} × ${ex.reps}`, cols[1], y + 6, {}, LIGHT, 8);
          text(ex.rest, cols[2], y + 6, {}, GREY, 8);
          text(ex.tempo || "—", cols[3], y + 6, {}, GREY, 7);
          text(ex.tips, cols[4], y + 6, { width: CW - (cols[4] - M) - 4 }, FAINT, 6);
          y += 22;
        });

        // Cool-down
        if (day.cooldown?.length) {
          y = checkY(y, 20);
          rect(M, y, CW, 18, "#1A0D1A");
          text("COOL-DOWN:  " + day.cooldown.join("  ·  "), M + 8, y + 5, { width: CW - 16 }, "#aa70aa", 7, "Helvetica-Bold");
          y += 24;
        }
        y += 8;
      }
    }

    // ════════════════════════════════════════════════════════════════════════
    // MEAL PLAN
    // ════════════════════════════════════════════════════════════════════════
    newPage();
    y = M;
    bold("7-DAY MEAL PLAN", M, y, { align: "center", width: CW }, GOLD, 18);
    text(`${plan.dailyCalories.toLocaleString()} kcal/day  ·  P: ${plan.macros.protein}g  ·  C: ${plan.macros.carbs}g  ·  F: ${plan.macros.fat}g`, M, y + 26, { align: "center", width: CW }, GREY, 8);
    y += 48;

    const mealOrder: Array<{ key: keyof DayMeals["meals"]; emoji: string; label: string }> = [
      { key: "breakfast", emoji: "🌅", label: "Breakfast" },
      { key: "morningSnack", emoji: "🍎", label: "Morning Snack" },
      { key: "lunch", emoji: "☀️", label: "Lunch" },
      { key: "afternoonSnack", emoji: "⚡", label: "Pre-Workout" },
      { key: "dinner", emoji: "🌙", label: "Dinner" },
    ];

    for (const dayMeal of plan.mealPlan) {
      y = checkY(y, 100);

      // Day header
      rect(M, y, CW, 26, DARK3); rect(M, y, 4, 26, GOLD);
      bold(dayMeal.day.toUpperCase(), M + 14, y + 4, {}, GOLD, 10);
      text(`${dayMeal.totalCalories} kcal  ·  P: ${dayMeal.totalProtein}g  C: ${dayMeal.totalCarbs}g  F: ${dayMeal.totalFat}g`,
        M + 14, y + 16, {}, GREY, 7);
      y += 30;

      for (const { key, emoji, label } of mealOrder) {
        const meal = dayMeal.meals[key];
        if (!meal) continue;
        y = checkY(y, 44);

        rect(M, y, CW, 42, DARK2);
        // Left accent colour per meal
        const mColors = ["#C9A84C", "#4CAF50", "#4C8BC9", "#C94CAF", "#C96C4C"];
        rect(M, y, 3, 42, mColors[mealOrder.findIndex(m => m.key === key)] ?? GOLD);

        bold(`${emoji}  ${label}`, M + 10, y + 5, {}, LIGHT, 8);
        bold(meal.name, M + 100, y + 5, { width: CW - 180 }, WHITE, 8);
        text(`${meal.calories} kcal  P:${meal.protein}g  C:${meal.carbs}g  F:${meal.fat}g`,
          PAGE_W - M - 130, y + 5, { align: "right", width: 130 }, GREY, 7);
        text(meal.description, M + 10, y + 20, { width: CW - 20 }, FAINT, 7);
        y += 46;
      }
      y += 6;
    }

    // ════════════════════════════════════════════════════════════════════════
    // SUPPLEMENT PROTOCOL
    // ════════════════════════════════════════════════════════════════════════
    newPage();
    y = M;
    bold("SUPPLEMENT PROTOCOL", M, y, { align: "center", width: CW }, GOLD, 18);
    text("Personalised recommendations based on your goal and diet", M, y + 26, { align: "center", width: CW }, GREY, 9);
    y += 50;

    y = sectionHeader("RECOMMENDED SUPPLEMENTS", y);

    for (const sup of plan.supplements) {
      y = checkY(y, 60);
      rect(M, y, CW, 56, DARK2); rect(M, y, 4, 56, badgeColor(sup.priority));

      const badge = sup.priority.toUpperCase();
      const badgeW = badge.length * 5 + 10;
      rect(PAGE_W - M - badgeW - 4, y + 8, badgeW, 14, badgeColor(sup.priority));
      text(badge, PAGE_W - M - badgeW - 4, y + 11, { align: "center", width: badgeW }, DARK, 6, "Helvetica-Bold");

      bold(sup.name, M + 14, y + 8, {}, WHITE, 10);
      text(`${sup.dosage}  ·  ${sup.timing}`, M + 14, y + 22, {}, GREY, 8);
      text(sup.benefit, M + 14, y + 34, { width: CW - badgeW - 28 }, FAINT, 7);
      y += 62;
    }

    // ════════════════════════════════════════════════════════════════════════
    // RECOVERY PROTOCOL
    // ════════════════════════════════════════════════════════════════════════
    y = checkY(y, 120);
    y += 10;
    y = sectionHeader("RECOVERY & WELLNESS PROTOCOL", y);

    bold("💤  Sleep", M, y, {}, LIGHT, 9); y += 16;
    rect(M, y, 4, 36, "#4C8BC9");
    text(plan.recoveryProtocol.sleepRecommendation, M + 12, y + 4, { width: CW - 12 }, LIGHT, 8);
    y += 42;

    bold("🏃  Active Recovery", M, y, {}, LIGHT, 9); y += 14;
    plan.recoveryProtocol.activeRecoveryTips?.forEach(t => {
      y = checkY(y, 16);
      text(`→  ${t}`, M + 8, y, { width: CW - 8 }, LIGHT, 8); y += 16;
    });
    y += 8;

    bold("🧘  Mobility Routine", M, y, {}, LIGHT, 9); y += 14;
    plan.recoveryProtocol.mobilityRoutine?.forEach((t, i) => {
      y = checkY(y, 16);
      rect(M, y, CW, 16, i % 2 === 0 ? DARK3 : "transparent");
      text(`${i + 1}.  ${t}`, M + 8, y + 4, { width: CW - 8 }, LIGHT, 8); y += 16;
    });
    y += 8;

    bold("🧠  Stress Management", M, y, {}, LIGHT, 9); y += 14;
    plan.recoveryProtocol.stressManagement?.forEach(t => {
      y = checkY(y, 16);
      text(`◆  ${t}`, M + 8, y, { width: CW - 8 }, GREY, 8); y += 16;
    });

    // ════════════════════════════════════════════════════════════════════════
    // COACH LETTER
    // ════════════════════════════════════════════════════════════════════════
    newPage();
    y = M;
    bold("A MESSAGE FROM YOUR COACH", M, y, { align: "center", width: CW }, GOLD, 14);
    y += 28;
    rect(M, y, CW, 1, GOLD);
    y += 16;

    // Decorative quotes
    bold("\u201C", M, y - 8, {}, GOLD, 48);
    const letterLines = (plan.coachLetter || "").split("\n").filter(l => l.trim());
    letterLines.forEach(para => {
      y = checkY(y, 40);
      text(para, M + 12, y, { width: CW - 24, lineBreak: true, align: "justify" }, LIGHT, 9, "Helvetica");
      y += doc.currentLineHeight(true) + 12;
    });
    y += 8;
    bold("— Coach Tarik Islam", M, y, { align: "right", width: CW }, GOLD, 9);
    y += 20;
    text("tarikislam.in", M, y, { align: "right", width: CW }, GREY, 8);

    // ════════════════════════════════════════════════════════════════════════
    // PROGRESS TRACKER PAGE
    // ════════════════════════════════════════════════════════════════════════
    newPage();
    y = M;
    bold("PROGRESS TRACKER", M, y, { align: "center", width: CW }, GOLD, 18);
    text("Track your weekly stats — print this page and fill in each week", M, y + 26, { align: "center", width: CW }, GREY, 9);
    y += 50;

    y = sectionHeader("WEEKLY MEASUREMENTS", y);

    // Column headers
    const tCols = [M, M + 70, M + 140, M + 200, M + 265, M + 330, M + 395, M + 455];
    const tHdrs = ["Week", "Weight kg", "Waist cm", "Chest cm", "Arms cm", "Thigh cm", "Energy 1-10", "Notes"];
    rect(M, y, CW, 18, DARK4);
    tHdrs.forEach((h, i) => text(h, tCols[i], y + 5, {}, GREY, 6, "Helvetica-Bold"));
    y += 18;

    for (let w = 1; w <= 12; w++) {
      rect(M, y, CW, 20, w % 2 === 0 ? DARK3 : "transparent");
      bold(`Week ${w}`, tCols[0], y + 6, {}, LIGHT, 7);
      tCols.slice(1).forEach(cx => {
        rect(cx, y + 4, 55, 12, "#1A1A1A"); // blank fill-in box
      });
      y += 20;
    }

    y += 20;
    y = sectionHeader("GOAL CHECK-INS", y);
    [
      `Week 4 Goal: ${plan.progressMilestones.week4}`,
      `Week 8 Goal: ${plan.progressMilestones.week8}`,
      `Week 12 Goal: ${plan.progressMilestones.week12}`,
    ].forEach(g => {
      y = checkY(y, 32);
      rect(M, y, CW, 28, DARK2); rect(M, y, 4, 28, GOLD);
      text(g, M + 12, y + 9, { width: CW - 100 }, LIGHT, 8);
      text("Achieved: ☐  Date: ___________", PAGE_W - M - 150, y + 9, { align: "right", width: 150 }, GREY, 7);
      y += 34;
    });

    // ── FOOTERS ──────────────────────────────────────────────────────────────
    const range = doc.bufferedPageRange();
    for (let i = 0; i < range.count; i++) {
      doc.switchToPage(range.start + i);
      footer(i + 1, range.count);
    }

    doc.end();
    await new Promise<void>(resolve => doc.on("end", resolve));

    const pdf = Buffer.concat(buffers);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="tarikislam-fitness-plan-${(name as string).toLowerCase().replace(/\s+/g, "-")}.pdf"`);
    res.setHeader("Content-Length", pdf.length);
    res.send(pdf);

    req.log.info({ name, pages: range.count }, "Professional PDF plan sent");
  } catch (err) {
    req.log.error({ err }, "Failed to render PDF");
    res.status(500).json({ error: "Failed to render PDF. Please try again." });
  }
});

export default router;
