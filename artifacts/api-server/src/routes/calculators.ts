import { Router, type IRouter } from "express";
import { ComputeCalculatorsBody } from "@workspace/api-zod";

const router: IRouter = Router();

const ACTIVITY_MULTIPLIERS: Record<string, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

router.post("/calculators/compute", async (req, res): Promise<void> => {
  const parsed = ComputeCalculatorsBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const {
    weightKg,
    heightCm,
    age,
    gender,
    activityLevel,
    bodyFatPercent,
    wristCm,
    hipCm,
    waistCm,
    forearmCm,
    oneRepMaxWeightKg,
    oneRepMaxReps,
    exerciseMets,
    exerciseDurationMin,
    runDistanceKm,
    runTimeMin,
  } = parsed.data;

  // BMI
  const heightM = heightCm / 100;
  const bmi = weightKg / (heightM * heightM);
  let bmiCategory = "Normal";
  if (bmi < 18.5) bmiCategory = "Underweight";
  else if (bmi < 25) bmiCategory = "Normal";
  else if (bmi < 30) bmiCategory = "Overweight";
  else bmiCategory = "Obese";

  // BMR — Mifflin-St Jeor
  let bmr: number;
  if (gender === "male" || gender === "Male") {
    bmr = 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
  } else {
    bmr = 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
  }

  // TDEE
  const multiplier = ACTIVITY_MULTIPLIERS[activityLevel] ?? 1.55;
  const tdee = bmr * multiplier;

  // Calorie targets
  const fatLossCalories = Math.round(tdee - 500);
  const muscleGainCalories = Math.round(tdee + 300);
  const maintenanceCalories = Math.round(tdee);

  // Macros (based on maintenance)
  const proteinGrams = Math.round(weightKg * 2.2);
  const fatGrams = Math.round((maintenanceCalories * 0.25) / 9);
  const carbsGrams = Math.round(
    (maintenanceCalories - proteinGrams * 4 - fatGrams * 9) / 4,
  );

  // Water (ml → liters)
  const waterIntakeLiters = Math.round(weightKg * 35) / 1000;

  // Body composition
  let leanBodyMassKg: number | null = null;
  let bodyFatKg: number | null = null;
  if (bodyFatPercent != null) {
    bodyFatKg = Math.round((weightKg * bodyFatPercent) / 100 * 10) / 10;
    leanBodyMassKg = Math.round((weightKg - bodyFatKg) * 10) / 10;
  }

  // Ideal weight — Devine formula
  const inchesOver5Ft = Math.max(0, heightCm / 2.54 - 60);
  let idealWeightKgLow: number;
  let idealWeightKgHigh: number;
  if (gender === "male" || gender === "Male") {
    const base = 50 + 2.3 * inchesOver5Ft;
    idealWeightKgLow = Math.round((base - 5) * 10) / 10;
    idealWeightKgHigh = Math.round((base + 5) * 10) / 10;
  } else {
    const base = 45.5 + 2.3 * inchesOver5Ft;
    idealWeightKgLow = Math.round((base - 5) * 10) / 10;
    idealWeightKgHigh = Math.round((base + 5) * 10) / 10;
  }

  // One-Rep Max — Epley formula
  let oneRepMaxKg: number | null = null;
  if (oneRepMaxWeightKg != null && oneRepMaxReps != null && oneRepMaxReps > 0) {
    if (oneRepMaxReps === 1) {
      oneRepMaxKg = oneRepMaxWeightKg;
    } else {
      oneRepMaxKg =
        Math.round(oneRepMaxWeightKg * (1 + oneRepMaxReps / 30) * 10) / 10;
    }
  }

  // Calories burned (MET formula)
  let caloriesBurned: number | null = null;
  if (exerciseMets != null && exerciseDurationMin != null) {
    caloriesBurned = Math.round(
      exerciseMets * weightKg * (exerciseDurationMin / 60),
    );
  }

  // Pace (min/km)
  let pace: number | null = null;
  if (runDistanceKm != null && runTimeMin != null && runDistanceKm > 0) {
    pace = Math.round((runTimeMin / runDistanceKm) * 100) / 100;
  }

  res.json({
    bmi: Math.round(bmi * 10) / 10,
    bmiCategory,
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    fatLossCalories,
    muscleGainCalories,
    maintenanceCalories,
    proteinGrams,
    carbsGrams,
    fatGrams,
    waterIntakeLiters,
    leanBodyMassKg,
    bodyFatKg,
    idealWeightKgLow,
    idealWeightKgHigh,
    oneRepMaxKg,
    caloriesBurned,
    pace,
  });
});

export default router;
