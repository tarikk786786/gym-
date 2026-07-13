import { Router, type IRouter } from "express";
import { getAuth } from "@clerk/express";
import { eq, desc } from "drizzle-orm";
import {
  db,
  profilesTable,
  workoutPlansTable,
  dietPlansTable,
  progressLogsTable,
} from "@workspace/db";
import PDFDocument from "pdfkit";

const router: IRouter = Router();

// Colors
const GOLD = "#FFD700";
const BLACK = "#050505";
const DARK_GRAY = "#1a1a1a";
const MID_GRAY = "#888888";
const WHITE = "#FFFFFF";

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

function drawSection(
  doc: PDFKit.PDFDocument,
  title: string,
  y: number,
): number {
  doc
    .rect(50, y, doc.page.width - 100, 2)
    .fill(GOLD);
  doc
    .font("Helvetica-Bold")
    .fontSize(13)
    .fillColor(GOLD)
    .text(title, 50, y + 8);
  return y + 28;
}

function drawFooter(doc: PDFKit.PDFDocument) {
  const y = doc.page.height - 50;
  doc
    .moveTo(50, y)
    .lineTo(doc.page.width - 50, y)
    .strokeColor(GOLD)
    .lineWidth(0.5)
    .stroke();
  doc
    .font("Helvetica")
    .fontSize(8)
    .fillColor(MID_GRAY)
    .text(
      "Designed & Developed by Tarik Islam — https://tarikislam.in",
      50,
      y + 8,
      { align: "center", width: doc.page.width - 100 },
    );
}

// ─── GET /reports/generate ────────────────────────────────────────────────────
router.get(
  "/reports/generate",
  requireAuth,
  async (req: any, res): Promise<void> => {
    const [profile, workoutPlans, dietPlans, recentLogs] = await Promise.all([
      db
        .select()
        .from(profilesTable)
        .where(eq(profilesTable.id, req.userId))
        .limit(1)
        .then((r) => r[0] ?? null),
      db
        .select()
        .from(workoutPlansTable)
        .where(eq(workoutPlansTable.userId, req.userId))
        .orderBy(desc(workoutPlansTable.createdAt))
        .limit(1),
      db
        .select()
        .from(dietPlansTable)
        .where(eq(dietPlansTable.userId, req.userId))
        .orderBy(desc(dietPlansTable.createdAt))
        .limit(1),
      db
        .select()
        .from(progressLogsTable)
        .where(eq(progressLogsTable.userId, req.userId))
        .orderBy(desc(progressLogsTable.logDate))
        .limit(30),
    ]);

    const activeWorkout = workoutPlans[0] ?? null;
    const activeDiet = dietPlans[0] ?? null;

    // BMI
    let bmi: number | null = null;
    let bmiCategory = "";
    if (profile?.heightCm && profile?.weightKg) {
      const h = profile.heightCm / 100;
      bmi = Math.round((profile.weightKg / (h * h)) * 10) / 10;
      if (bmi < 18.5) bmiCategory = "Underweight";
      else if (bmi < 25) bmiCategory = "Normal";
      else if (bmi < 30) bmiCategory = "Overweight";
      else bmiCategory = "Obese";
    }

    // TDEE
    let tdee: number | null = null;
    if (profile?.weightKg && profile?.heightCm && profile?.age && profile?.gender) {
      const bmr =
        profile.gender === "male" || profile.gender === "Male"
          ? 10 * profile.weightKg + 6.25 * profile.heightCm - 5 * profile.age + 5
          : 10 * profile.weightKg + 6.25 * profile.heightCm - 5 * profile.age - 161;
      const multipliers: Record<string, number> = {
        sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, very_active: 1.9,
      };
      tdee = Math.round(bmr * (multipliers[profile.activityLevel ?? ""] ?? 1.55));
    }

    const generatedAt = new Date().toLocaleDateString("en-GB", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="fitness-report-${new Date().toISOString().split("T")[0]}.pdf"`,
    );

    const doc = new PDFDocument({ size: "A4", margin: 50 });
    doc.pipe(res);

    // ── PAGE 1: Cover ─────────────────────────────────────────────────────────
    doc.rect(0, 0, doc.page.width, doc.page.height).fill(BLACK);

    // Gold border
    doc
      .rect(20, 20, doc.page.width - 40, doc.page.height - 40)
      .stroke(GOLD)
      .lineWidth(1);

    // Header accent bar
    doc.rect(0, 0, doc.page.width, 8).fill(GOLD);

    // Logo / brand
    doc
      .font("Helvetica-Bold")
      .fontSize(11)
      .fillColor(GOLD)
      .text("TARIK ISLAM", 50, 40, { align: "center", width: doc.page.width - 100 });

    doc
      .font("Helvetica")
      .fontSize(9)
      .fillColor(MID_GRAY)
      .text("AI GYM PLANNER", 50, 56, { align: "center", width: doc.page.width - 100 });

    // Main title
    doc
      .font("Helvetica-Bold")
      .fontSize(42)
      .fillColor(WHITE)
      .text("FITNESS", 50, 180, { align: "center", width: doc.page.width - 100 });
    doc
      .font("Helvetica-Bold")
      .fontSize(42)
      .fillColor(GOLD)
      .text("REPORT", 50, 228, { align: "center", width: doc.page.width - 100 });

    // Gold divider
    doc
      .moveTo(200, 285)
      .lineTo(doc.page.width - 200, 285)
      .strokeColor(GOLD)
      .lineWidth(1)
      .stroke();

    // Client info
    doc
      .font("Helvetica-Bold")
      .fontSize(18)
      .fillColor(WHITE)
      .text(profile?.fullName || "Athlete", 50, 300, {
        align: "center",
        width: doc.page.width - 100,
      });

    // Stats grid
    const stats = [
      { label: "BMI", value: bmi ? `${bmi} (${bmiCategory})` : "—" },
      { label: "TDEE", value: tdee ? `${tdee} kcal` : "—" },
      { label: "Goal", value: profile?.goal || "—" },
      { label: "Experience", value: profile?.workoutExperience || "—" },
    ];

    let sx = 50;
    const sy = 380;
    const sw = (doc.page.width - 100) / 4 - 8;
    for (const stat of stats) {
      doc.rect(sx, sy, sw, 64).fill(DARK_GRAY).stroke(GOLD).lineWidth(0.5);
      doc
        .font("Helvetica")
        .fontSize(8)
        .fillColor(MID_GRAY)
        .text(stat.label, sx + 8, sy + 10, { width: sw - 16 });
      doc
        .font("Helvetica-Bold")
        .fontSize(11)
        .fillColor(GOLD)
        .text(stat.value, sx + 8, sy + 24, { width: sw - 16 });
      sx += sw + 10;
    }

    // Date
    doc
      .font("Helvetica")
      .fontSize(10)
      .fillColor(MID_GRAY)
      .text(`Generated: ${generatedAt}`, 50, 480, {
        align: "center",
        width: doc.page.width - 100,
      });

    // Motivational quote
    doc
      .font("Helvetica-Oblique")
      .fontSize(11)
      .fillColor(GOLD)
      .text(
        '"The groundwork for all happiness is good health."',
        50,
        560,
        { align: "center", width: doc.page.width - 100 },
      );
    doc
      .font("Helvetica")
      .fontSize(9)
      .fillColor(MID_GRAY)
      .text("— Leigh Hunt", 50, 580, {
        align: "center",
        width: doc.page.width - 100,
      });

    drawFooter(doc);

    // ── PAGE 2: Personal Details & Fitness Analysis ───────────────────────────
    doc.addPage({ size: "A4", margin: 50 });
    doc.rect(0, 0, doc.page.width, doc.page.height).fill(BLACK);
    doc.rect(0, 0, doc.page.width, 8).fill(GOLD);

    let y = 30;
    y = drawSection(doc, "PERSONAL DETAILS", y);
    y += 8;

    const details = [
      ["Full Name", profile?.fullName || "—"],
      ["Age", profile?.age ? `${profile.age} years` : "—"],
      ["Gender", profile?.gender || "—"],
      ["Height", profile?.heightCm ? `${profile.heightCm} cm` : "—"],
      ["Weight", profile?.weightKg ? `${profile.weightKg} kg` : "—"],
      ["Activity Level", profile?.activityLevel || "—"],
      ["Gym Available", profile?.gymAvailability ? "Yes" : "No"],
      ["Equipment", profile?.equipment || "—"],
      ["Allergies", profile?.allergies || "None"],
      ["Injuries", profile?.injuries || "None"],
      ["Medical Conditions", profile?.medicalConditions || "None"],
    ];

    for (const [label, value] of details) {
      doc
        .font("Helvetica-Bold")
        .fontSize(10)
        .fillColor(MID_GRAY)
        .text(label + ":", 50, y, { width: 160 });
      doc
        .font("Helvetica")
        .fontSize(10)
        .fillColor(WHITE)
        .text(value, 220, y, { width: 300 });
      y += 18;
    }

    y += 16;
    y = drawSection(doc, "FITNESS ANALYSIS", y);
    y += 8;

    const analysis = [
      ["BMI", bmi ? `${bmi} — ${bmiCategory}` : "—"],
      ["TDEE (maintenance)", tdee ? `${tdee} kcal/day` : "—"],
      ["Fat loss target", tdee ? `${tdee - 500} kcal/day` : "—"],
      ["Muscle gain target", tdee ? `${tdee + 300} kcal/day` : "—"],
      ["Daily protein", profile?.weightKg ? `${Math.round(profile.weightKg * 2.2)}g` : "—"],
      ["Daily water", profile?.weightKg ? `${Math.round(profile.weightKg * 35) / 1000}L` : "—"],
    ];

    for (const [label, value] of analysis) {
      doc
        .font("Helvetica-Bold")
        .fontSize(10)
        .fillColor(MID_GRAY)
        .text(label + ":", 50, y, { width: 180 });
      doc
        .font("Helvetica-Bold")
        .fontSize(10)
        .fillColor(GOLD)
        .text(value, 240, y, { width: 280 });
      y += 18;
    }

    // Body measurements
    if (
      profile?.chestCm ||
      profile?.waistCm ||
      profile?.hipsCm ||
      profile?.armsCm
    ) {
      y += 10;
      y = drawSection(doc, "BODY MEASUREMENTS", y);
      y += 8;
      const measurements = [
        ["Chest", profile?.chestCm ? `${profile.chestCm} cm` : "—"],
        ["Waist", profile?.waistCm ? `${profile.waistCm} cm` : "—"],
        ["Hips", profile?.hipsCm ? `${profile.hipsCm} cm` : "—"],
        ["Arms", profile?.armsCm ? `${profile.armsCm} cm` : "—"],
        ["Thighs", profile?.thighsCm ? `${profile.thighsCm} cm` : "—"],
        ["Shoulders", profile?.shouldersCm ? `${profile.shouldersCm} cm` : "—"],
      ];
      for (const [label, value] of measurements) {
        doc.font("Helvetica-Bold").fontSize(10).fillColor(MID_GRAY).text(label + ":", 50, y, { width: 160 });
        doc.font("Helvetica").fontSize(10).fillColor(WHITE).text(value, 220, y, { width: 200 });
        y += 18;
      }
    }

    drawFooter(doc);

    // ── PAGE 3: Recent Progress ───────────────────────────────────────────────
    if (recentLogs.length > 0) {
      doc.addPage({ size: "A4", margin: 50 });
      doc.rect(0, 0, doc.page.width, doc.page.height).fill(BLACK);
      doc.rect(0, 0, doc.page.width, 8).fill(GOLD);
      y = 30;
      y = drawSection(doc, "RECENT PROGRESS (LAST 30 DAYS)", y);
      y += 12;

      // Table headers
      const cols = ["Date", "Weight", "Calories", "Water", "Sleep", "Workout"];
      const widths = [80, 65, 65, 55, 55, 65];
      let cx = 50;
      doc.rect(50, y, doc.page.width - 100, 20).fill(DARK_GRAY);
      for (let i = 0; i < cols.length; i++) {
        doc.font("Helvetica-Bold").fontSize(8).fillColor(GOLD).text(cols[i]!, cx + 4, y + 6, { width: widths[i]! - 8 });
        cx += widths[i]!;
      }
      y += 22;

      for (let i = 0; i < Math.min(recentLogs.length, 25); i++) {
        const log = recentLogs[i]!;
        if (i % 2 === 0) {
          doc.rect(50, y, doc.page.width - 100, 18).fill("#0d0d0d");
        }
        const row = [
          log.logDate,
          log.weightKg ? `${log.weightKg}kg` : "—",
          log.caloriesConsumed ? `${log.caloriesConsumed}` : "—",
          log.waterLiters ? `${log.waterLiters}L` : "—",
          log.sleepHours ? `${log.sleepHours}h` : "—",
          log.workoutCompleted ? "Done" : "—",
        ];
        cx = 50;
        for (let j = 0; j < row.length; j++) {
          doc
            .font("Helvetica")
            .fontSize(8)
            .fillColor(j === 5 && log.workoutCompleted ? GOLD : WHITE)
            .text(row[j]!, cx + 4, y + 5, { width: widths[j]! - 8 });
          cx += widths[j]!;
        }
        y += 18;
      }

      drawFooter(doc);
    }

    // ── PAGE 4: Active Workout Plan ───────────────────────────────────────────
    if (activeWorkout) {
      doc.addPage({ size: "A4", margin: 50 });
      doc.rect(0, 0, doc.page.width, doc.page.height).fill(BLACK);
      doc.rect(0, 0, doc.page.width, 8).fill(GOLD);
      y = 30;
      y = drawSection(doc, "ACTIVE WORKOUT PLAN", y);
      y += 8;

      const plan = activeWorkout.plan as any;
      doc.font("Helvetica-Bold").fontSize(16).fillColor(WHITE).text(plan.programName || "Workout Plan", 50, y);
      y += 22;
      doc.font("Helvetica").fontSize(10).fillColor(MID_GRAY).text(`Duration: ${plan.duration || "—"}  |  Goal: ${activeWorkout.goal}  |  Experience: ${activeWorkout.experience}`, 50, y);
      y += 16;
      doc.font("Helvetica").fontSize(10).fillColor(WHITE).text(plan.overview || "", 50, y, { width: doc.page.width - 100 });
      y += doc.heightOfString(plan.overview || "", { width: doc.page.width - 100 }) + 12;

      const schedule = plan.weeklySchedule || [];
      for (const day of schedule.slice(0, 4)) {
        if (y > doc.page.height - 150) break;
        doc.rect(50, y, doc.page.width - 100, 22).fill(DARK_GRAY);
        doc.font("Helvetica-Bold").fontSize(11).fillColor(GOLD).text(`${day.day} — ${day.sessionName}`, 58, y + 6);
        doc.font("Helvetica").fontSize(9).fillColor(MID_GRAY).text(`~${day.estimatedDurationMin}min | ${day.targetMuscles}`, doc.page.width - 200, y + 8, { width: 140, align: "right" });
        y += 26;

        for (const ex of (day.exercises || []).slice(0, 5)) {
          if (y > doc.page.height - 100) break;
          doc.font("Helvetica-Bold").fontSize(9).fillColor(WHITE).text(`• ${ex.name}`, 58, y, { width: 250 });
          doc.font("Helvetica").fontSize(9).fillColor(MID_GRAY).text(`${ex.sets}×${ex.reps}  |  rest ${ex.rest}  |  RPE ${ex.rpe}`, 310, y, { width: 220 });
          y += 14;
        }
        y += 8;
      }

      if (plan.progressionNotes) {
        y += 8;
        doc.font("Helvetica-Bold").fontSize(10).fillColor(GOLD).text("Progression Notes:", 50, y);
        y += 14;
        doc.font("Helvetica-Oblique").fontSize(9).fillColor(WHITE).text(plan.progressionNotes, 50, y, { width: doc.page.width - 100 });
      }

      drawFooter(doc);
    }

    // ── PAGE 5: Active Diet Plan ──────────────────────────────────────────────
    if (activeDiet) {
      doc.addPage({ size: "A4", margin: 50 });
      doc.rect(0, 0, doc.page.width, doc.page.height).fill(BLACK);
      doc.rect(0, 0, doc.page.width, 8).fill(GOLD);
      y = 30;
      y = drawSection(doc, "ACTIVE DIET PLAN", y);
      y += 8;

      const dplan = activeDiet.plan as any;
      doc.font("Helvetica-Bold").fontSize(16).fillColor(WHITE).text(`${activeDiet.dietStyle} — ${activeDiet.cuisine} Cuisine`, 50, y);
      y += 22;
      doc.font("Helvetica-Bold").fontSize(12).fillColor(GOLD).text(`Daily Target: ${dplan.dailyCalorieTarget || activeDiet.calorieTarget} kcal`, 50, y);
      y += 18;

      // Macros
      if (dplan.macros) {
        const m = dplan.macros;
        doc.font("Helvetica").fontSize(10).fillColor(WHITE).text(`Protein: ${m.proteinG}g  |  Carbs: ${m.carbsG}g  |  Fat: ${m.fatG}g  |  Fiber: ${m.fiberG}g`, 50, y);
        y += 18;
      }

      y += 4;
      for (const meal of (dplan.meals || []).slice(0, 6)) {
        if (y > doc.page.height - 80) break;
        doc.rect(50, y, doc.page.width - 100, 20).fill(DARK_GRAY);
        doc.font("Helvetica-Bold").fontSize(10).fillColor(GOLD).text(`${meal.name}`, 58, y + 5);
        doc.font("Helvetica").fontSize(9).fillColor(MID_GRAY).text(`${meal.time}  |  ${meal.calories} kcal`, doc.page.width - 220, y + 7, { align: "right", width: 160 });
        y += 22;
        for (const item of (meal.items || []).slice(0, 4)) {
          doc.font("Helvetica").fontSize(8.5).fillColor(WHITE).text(`  • ${item}`, 58, y, { width: doc.page.width - 116 });
          y += 13;
        }
        y += 4;
      }

      if (dplan.nutritionTips) {
        y += 8;
        doc.font("Helvetica-Bold").fontSize(10).fillColor(GOLD).text("Nutrition Tips:", 50, y);
        y += 14;
        doc.font("Helvetica-Oblique").fontSize(9).fillColor(WHITE).text(dplan.nutritionTips, 50, y, { width: doc.page.width - 100 });
      }

      drawFooter(doc);
    }

    doc.end();
  },
);

export default router;
