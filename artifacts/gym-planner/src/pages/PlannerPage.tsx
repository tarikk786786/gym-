import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dumbbell, ChevronRight, ChevronLeft, CheckCircle, Loader2,
  Download, RotateCcw, AlertCircle, User, Target, Activity,
  Utensils, ClipboardList, Zap, Flame, Heart, Moon, Brain,
  BarChart3, Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

// ─── Schemas ─────────────────────────────────────────────────────────────────

// Converts empty strings / null / undefined → undefined so optional numeric
// inputs don't fail min/max validation when the user leaves them blank.
const optNum = (min?: number, max?: number, integer = false) =>
  z.preprocess(
    v => (v === "" || v === null || v === undefined ? undefined : Number(v)),
    integer
      ? z.number().int().min(min ?? -Infinity).max(max ?? Infinity).optional()
      : z.number().min(min ?? -Infinity).max(max ?? Infinity).optional(),
  );

const s1 = z.object({
  name: z.string().min(1, "Full name is required"),
  age: z.coerce.number().int().min(10, "Min 10").max(100, "Max 100"),
  gender: z.enum(["male", "female", "other"], { required_error: "Select gender" }),
});
const s2 = z.object({
  heightCm: z.coerce.number().min(50, "Min 50 cm").max(260, "Max 260 cm"),
  weightKg: z.coerce.number().min(20, "Min 20 kg").max(350, "Max 350 kg"),
  bodyFatPercent: optNum(1, 70),
  targetWeightKg: optNum(20, 350),
  timeframeWeeks: optNum(4, 52, true),
});
const s3 = z.object({
  goal: z.enum(["weight_loss", "muscle_gain", "maintain", "recomposition", "strength", "endurance"], { required_error: "Select a goal" }),
  activityLevel: z.enum(["sedentary", "light", "moderate", "active", "very_active"], { required_error: "Select activity level" }),
  sleepHours: optNum(3, 12),
  stressLevel: optNum(1, 5, true),
  jobType: z.enum(["sedentary", "standing", "active"]).optional(),
});
const s4 = z.object({
  experience: z.enum(["beginner", "intermediate", "advanced"], { required_error: "Select experience" }),
  workoutLocation: z.enum(["gym", "home", "both"], { required_error: "Select location" }),
  daysPerWeek: z.coerce.number().int().min(2).max(7),
  preferredWorkoutTime: z.enum(["morning", "afternoon", "evening", "any"]).optional(),
  equipment: z.string().optional(),
});
const s5 = z.object({
  dietStyle: z.enum(["any", "high_protein", "vegetarian", "vegan", "keto", "paleo", "mediterranean"], { required_error: "Select diet" }),
  foodPreferences: z.string().optional(),
  injuriesOrAllergies: z.string().optional(),
  medicalConditions: z.string().optional(),
});

const schemas = [s1, s2, s3, s4, s5, z.object({})];

type FormData = z.infer<typeof s1> & z.infer<typeof s2> & z.infer<typeof s3> & z.infer<typeof s4> & z.infer<typeof s5>;
type PageState = "form" | "loading" | "success" | "error";

// ─── Step config ─────────────────────────────────────────────────────────────
const STEPS = [
  { title: "Personal Info",    short: "You",        icon: User,         color: "text-blue-400" },
  { title: "Body Stats",       short: "Body",       icon: BarChart3,    color: "text-emerald-400" },
  { title: "Goal & Lifestyle", short: "Goal",       icon: Target,       color: "text-yellow-400" },
  { title: "Training Plan",   short: "Training",   icon: Dumbbell,     color: "text-orange-400" },
  { title: "Diet & Health",    short: "Diet",       icon: Utensils,     color: "text-pink-400" },
  { title: "Review & Generate", short: "Generate",  icon: Zap,          color: "text-primary" },
];

// ─── Chip ─────────────────────────────────────────────────────────────────────
function Chip({ label, selected, onClick, emoji, desc }: { label: string; selected: boolean; onClick: () => void; emoji?: string; desc?: string }) {
  return (
    <button type="button" onClick={onClick}
      className={`relative px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all flex items-start gap-3 text-left w-full
        ${selected ? "border-primary bg-primary/10 text-primary shadow-sm shadow-primary/20" : "border-border/40 text-foreground/70 hover:border-primary/40 hover:bg-primary/5"}`}>
      {emoji && <span className="text-base mt-0.5 flex-shrink-0">{emoji}</span>}
      <div className="min-w-0">
        <p className="font-semibold">{label}</p>
        {desc && <p className="text-xs text-muted-foreground font-normal mt-0.5 leading-snug">{desc}</p>}
      </div>
      {selected && <CheckCircle className="w-4 h-4 absolute top-3 right-3 text-primary flex-shrink-0" />}
    </button>
  );
}

function Field({ label, error, hint, children }: { label: string; error?: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-semibold text-foreground/90">{label}</Label>
      {children}
      {hint && !error && <p className="text-xs text-muted-foreground">{hint}</p>}
      {error && <p className="text-xs text-red-400 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{error}</p>}
    </div>
  );
}

function NumPicker({ value, onChange, min, max, label }: { value: number | undefined; onChange: (v: number) => void; min: number; max: number; label: (v: number) => string }) {
  return (
    <div className="flex gap-2 flex-wrap">
      {Array.from({ length: max - min + 1 }, (_, i) => i + min).map(n => (
        <button key={n} type="button" onClick={() => onChange(n)}
          className={`h-11 w-11 rounded-xl border-2 font-bold text-sm transition-all flex-shrink-0
            ${Number(value) === n ? "border-primary bg-primary/15 text-primary" : "border-border/40 text-foreground/60 hover:border-primary/40"}`}>
          {label(n)}
        </button>
      ))}
    </div>
  );
}

// ─── BMI / Calorie preview ────────────────────────────────────────────────────
function MetricsPreview({ data }: { data: Partial<FormData> }) {
  const { heightCm, weightKg, age, gender, activityLevel, goal } = data;
  const bmi = useMemo(() => {
    if (!heightCm || !weightKg) return null;
    const h = Number(heightCm) / 100;
    return Number(weightKg) / (h * h);
  }, [heightCm, weightKg]);

  const tdee = useMemo(() => {
    if (!heightCm || !weightKg || !age) return null;
    const bmr = gender === "female"
      ? 10 * Number(weightKg) + 6.25 * Number(heightCm) - 5 * Number(age) - 161
      : 10 * Number(weightKg) + 6.25 * Number(heightCm) - 5 * Number(age) + 5;
    const mult: Record<string, number> = { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, very_active: 1.9 };
    return Math.round(bmr * (mult[activityLevel ?? "moderate"] ?? 1.55));
  }, [heightCm, weightKg, age, gender, activityLevel]);

  const target = useMemo(() => {
    if (!tdee) return null;
    const adj: Record<string, number> = { weight_loss: -500, muscle_gain: 300, maintain: 0, recomposition: -200, strength: 200, endurance: 100 };
    return tdee + (adj[goal ?? "maintain"] ?? 0);
  }, [tdee, goal]);

  const bmiLabel = !bmi ? "—" : bmi < 18.5 ? "Underweight" : bmi < 25 ? "Normal" : bmi < 30 ? "Overweight" : "Obese";
  const bmiColor = !bmi ? "text-muted-foreground" : bmi < 18.5 ? "text-blue-400" : bmi < 25 ? "text-emerald-400" : bmi < 30 ? "text-yellow-400" : "text-red-400";

  if (!bmi && !tdee) return null;

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-muted/30 border border-border/30 mb-4">
      <div className="text-center">
        <p className={`text-lg font-bold ${bmiColor}`}>{bmi ? bmi.toFixed(1) : "—"}</p>
        <p className="text-xs text-muted-foreground">BMI</p>
        <p className={`text-xs font-medium ${bmiColor}`}>{bmiLabel}</p>
      </div>
      <div className="text-center border-x border-border/30">
        <p className="text-lg font-bold text-foreground">{tdee ? tdee.toLocaleString() : "—"}</p>
        <p className="text-xs text-muted-foreground">TDEE (kcal)</p>
        <p className="text-xs font-medium text-muted-foreground">maintenance</p>
      </div>
      <div className="text-center">
        <p className="text-lg font-bold text-primary">{target ? target.toLocaleString() : "—"}</p>
        <p className="text-xs text-muted-foreground">Target (kcal)</p>
        <p className="text-xs font-medium text-primary">for goal</p>
      </div>
    </motion.div>
  );
}

// ─── Step 1: Personal Info ────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function StepPersonal({ form }: { form: any }) {
  const { register, watch, setValue, formState: { errors } } = form;
  const gender = watch("gender");
  return (
    <div className="space-y-5">
      <Field label="Full Name" error={errors.name?.message as string}>
        <Input {...register("name")} placeholder="Alex Johnson" className="h-12 text-base" autoFocus />
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Age" error={errors.age?.message as string}>
          <Input type="number" {...register("age")} placeholder="25" className="h-12 text-base" />
        </Field>
        <Field label="Gender" error={errors.gender?.message as string}>
          <div className="flex gap-2 h-12">
            {([["male","♂ Male"],["female","♀ Female"],["other","⚥ Other"]] as const).map(([v, l]) => (
              <button key={v} type="button" onClick={() => setValue("gender", v)}
                className={`flex-1 rounded-xl border-2 text-xs font-semibold transition-all ${gender === v ? "border-primary bg-primary/15 text-primary" : "border-border/40 text-foreground/60 hover:border-primary/40"}`}>
                {l}
              </button>
            ))}
          </div>
        </Field>
      </div>
    </div>
  );
}

// ─── Step 2: Body Stats ────────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function StepBody({ form, accumulated }: { form: any; accumulated: Partial<FormData> }) {
  const { register, formState: { errors } } = form;
  const merged = { ...accumulated, ...form.watch() };
  return (
    <div className="space-y-5">
      <MetricsPreview data={merged} />
      <div className="grid grid-cols-2 gap-4">
        <Field label="Height (cm)" error={errors.heightCm?.message as string}>
          <Input type="number" {...register("heightCm")} placeholder="175" className="h-12 text-base" />
        </Field>
        <Field label="Weight (kg)" error={errors.weightKg?.message as string}>
          <Input type="number" {...register("weightKg")} placeholder="75" className="h-12 text-base" />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Body Fat % (optional)" hint="Leave blank if unknown">
          <Input type="number" {...register("bodyFatPercent")} placeholder="20" className="h-12 text-base" />
        </Field>
        <Field label="Target Weight kg (optional)">
          <Input type="number" {...register("targetWeightKg")} placeholder="70" className="h-12 text-base" />
        </Field>
      </div>
      <Field label="Timeframe (weeks, optional)" hint="How many weeks to reach your goal?">
        <Input type="number" {...register("timeframeWeeks")} placeholder="12" className="h-12 text-base" />
      </Field>
    </div>
  );
}

// ─── Step 3: Goal & Lifestyle ─────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function StepGoal({ form, accumulated }: { form: any; accumulated: Partial<FormData> }) {
  const { watch, setValue, register, formState: { errors } } = form;
  const goal = watch("goal");
  const activity = watch("activityLevel");
  const job = watch("jobType");
  const merged = { ...accumulated, ...form.watch() };

  const goals = [
    { v: "weight_loss",  l: "Weight Loss",       e: "🔥", d: "Burn fat, slim down" },
    { v: "muscle_gain",  l: "Build Muscle",       e: "💪", d: "Gain size & strength" },
    { v: "recomposition",l: "Body Recomposition", e: "⚡", d: "Lose fat, gain muscle" },
    { v: "strength",     l: "Get Stronger",       e: "🏋️", d: "Max strength & power" },
    { v: "endurance",    l: "Endurance",          e: "🏃", d: "Stamina & cardio" },
    { v: "maintain",     l: "Maintain",           e: "⚖️", d: "Keep current physique" },
  ] as const;

  const activities = [
    { v: "sedentary",   l: "Sedentary",    d: "Desk job, little movement" },
    { v: "light",       l: "Light",        d: "Light walks 1–3×/week" },
    { v: "moderate",    l: "Moderate",     d: "Exercise 3–5×/week" },
    { v: "active",      l: "Active",       d: "Hard training 6–7×/week" },
    { v: "very_active", l: "Very Active",  d: "Physical job + daily training" },
  ] as const;

  return (
    <div className="space-y-6">
      <MetricsPreview data={merged} />
      <Field label="Primary Goal" error={errors.goal?.message as string}>
        <div className="grid grid-cols-2 gap-2">
          {goals.map(({ v, l, e, d }) => (
            <Chip key={v} label={l} emoji={e} desc={d} selected={goal === v} onClick={() => setValue("goal", v)} />
          ))}
        </div>
      </Field>
      <Field label="Activity Level" error={errors.activityLevel?.message as string}>
        <div className="space-y-1.5">
          {activities.map(({ v, l, d }) => (
            <button key={v} type="button" onClick={() => setValue("activityLevel", v)}
              className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl border-2 text-left transition-all
                ${activity === v ? "border-primary bg-primary/10" : "border-border/40 hover:border-primary/40"}`}>
              <div>
                <p className={`text-sm font-semibold ${activity === v ? "text-primary" : "text-foreground/80"}`}>{l}</p>
                <p className="text-xs text-muted-foreground">{d}</p>
              </div>
              {activity === v && <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />}
            </button>
          ))}
        </div>
      </Field>
      <div className="grid grid-cols-3 gap-3">
        <Field label={<span className="flex items-center gap-1"><Moon className="w-3 h-3" /> Sleep hrs</span> as unknown as string}>
          <Input type="number" {...register("sleepHours")} placeholder="7" className="h-11 text-base" />
        </Field>
        <Field label={<span className="flex items-center gap-1"><Brain className="w-3 h-3" /> Stress (1-5)</span> as unknown as string}>
          <Input type="number" {...register("stressLevel")} placeholder="3" min="1" max="5" className="h-11 text-base" />
        </Field>
        <Field label={<span className="flex items-center gap-1"><Activity className="w-3 h-3" /> Job type</span> as unknown as string}>
          <div className="flex flex-col gap-1">
            {(["sedentary","standing","active"] as const).map(j => (
              <button key={j} type="button" onClick={() => setValue("jobType", j)}
                className={`h-7 rounded-lg border text-xs font-medium transition-all capitalize ${job === j ? "border-primary bg-primary/15 text-primary" : "border-border/40 text-foreground/60"}`}>
                {j}
              </button>
            ))}
          </div>
        </Field>
      </div>
    </div>
  );
}

// ─── Step 4: Training ─────────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function StepTraining({ form }: { form: any }) {
  const { watch, setValue, register, formState: { errors } } = form;
  const exp = watch("experience");
  const loc = watch("workoutLocation");
  const time = watch("preferredWorkoutTime");

  return (
    <div className="space-y-6">
      <Field label="Training Experience" error={errors.experience?.message as string}>
        <div className="grid grid-cols-3 gap-2">
          {[
            { v: "beginner",     l: "Beginner",     e: "🌱", d: "< 1 year" },
            { v: "intermediate", l: "Intermediate", e: "⚡", d: "1–3 years" },
            { v: "advanced",     l: "Advanced",     e: "🏆", d: "3+ years" },
          ].map(({ v, l, e, d }) => (
            <Chip key={v} label={l} emoji={e} desc={d} selected={exp === v} onClick={() => setValue("experience", v)} />
          ))}
        </div>
      </Field>

      <Field label="Workout Location" error={errors.workoutLocation?.message as string}>
        <div className="grid grid-cols-3 gap-2">
          {[
            { v: "gym",  l: "Gym",       e: "🏋️", d: "Full equipment" },
            { v: "home", l: "Home",      e: "🏠", d: "Minimal gear" },
            { v: "both", l: "Both",      e: "🔄", d: "Mix of both" },
          ].map(({ v, l, e, d }) => (
            <Chip key={v} label={l} emoji={e} desc={d} selected={loc === v} onClick={() => setValue("workoutLocation", v)} />
          ))}
        </div>
      </Field>

      <Field label={`Days Per Week: ${watch("daysPerWeek") ?? 4} days`} error={errors.daysPerWeek?.message as string}>
        <NumPicker value={watch("daysPerWeek")} onChange={v => setValue("daysPerWeek", v)} min={2} max={7} label={n => `${n}`} />
      </Field>

      <Field label="Preferred Workout Time (optional)">
        <div className="grid grid-cols-4 gap-2">
          {[
            { v: "morning",   l: "Morning",   e: "🌅" },
            { v: "afternoon", l: "Afternoon",  e: "☀️" },
            { v: "evening",   l: "Evening",    e: "🌙" },
            { v: "any",       l: "Any",        e: "⏰" },
          ].map(({ v, l, e }) => (
            <button key={v} type="button" onClick={() => setValue("preferredWorkoutTime", v)}
              className={`py-2.5 rounded-xl border-2 text-xs font-semibold transition-all flex flex-col items-center gap-1
                ${time === v ? "border-primary bg-primary/15 text-primary" : "border-border/40 text-foreground/60 hover:border-primary/40"}`}>
              <span className="text-base">{e}</span>{l}
            </button>
          ))}
        </div>
      </Field>

      <Field label="Available Equipment (optional)" hint="e.g. dumbbells, resistance bands, pull-up bar">
        <Input {...register("equipment")} placeholder="e.g. dumbbells up to 30kg, barbell, bench" className="h-12 text-base" />
      </Field>
    </div>
  );
}

// ─── Step 5: Diet & Health ────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function StepDiet({ form }: { form: any }) {
  const { watch, setValue, register } = form;
  const diet = watch("dietStyle");

  return (
    <div className="space-y-6">
      <Field label="Diet Preference">
        <div className="grid grid-cols-2 gap-2">
          {[
            { v: "any",           l: "No Restriction",   e: "🍽️", d: "Eat everything" },
            { v: "high_protein",  l: "High Protein",     e: "🥩", d: "Protein-focused" },
            { v: "vegetarian",    l: "Vegetarian",       e: "🥗", d: "No meat" },
            { v: "vegan",         l: "Vegan",            e: "🌿", d: "Plant-based only" },
            { v: "keto",          l: "Ketogenic",        e: "🥑", d: "Low carb, high fat" },
            { v: "mediterranean", l: "Mediterranean",    e: "🫒", d: "Balanced & heart-healthy" },
            { v: "paleo",         l: "Paleo",            e: "🦴", d: "Whole foods, ancestral" },
          ].map(({ v, l, e, d }) => (
            <Chip key={v} label={l} emoji={e} desc={d} selected={diet === v} onClick={() => setValue("dietStyle", v)} />
          ))}
        </div>
      </Field>

      <Field label="Food Preferences (optional)" hint="Favourite foods or cuisines to include">
        <Input {...register("foodPreferences")} placeholder="e.g. love Indian food, prefer eggs for breakfast" className="h-12 text-base" />
      </Field>

      <Field label="Injuries or Allergies (optional)" hint="We'll avoid anything that could cause harm">
        <Textarea {...register("injuriesOrAllergies")} placeholder="e.g. bad left knee, nut allergy, lactose intolerant" className="min-h-[72px] text-sm resize-none" />
      </Field>

      <Field label="Medical Conditions (optional)" hint="Helps us tailor the plan safely">
        <Textarea {...register("medicalConditions")} placeholder="e.g. type 2 diabetes, hypertension, hypothyroidism" className="min-h-[72px] text-sm resize-none" />
      </Field>
    </div>
  );
}

// ─── Step 6: Review ────────────────────────────────────────────────────────────
function StepReview({ data }: { data: Partial<FormData> }) {
  const goalMap: Record<string, string> = { weight_loss: "Weight Loss 🔥", muscle_gain: "Build Muscle 💪", maintain: "Maintain ⚖️", recomposition: "Body Recomp ⚡", strength: "Strength 🏋️", endurance: "Endurance 🏃" };
  const actMap: Record<string, string> = { sedentary: "Sedentary", light: "Lightly Active", moderate: "Moderately Active", active: "Active", very_active: "Very Active" };
  const expMap: Record<string, string> = { beginner: "Beginner 🌱", intermediate: "Intermediate ⚡", advanced: "Advanced 🏆" };
  const locMap: Record<string, string> = { gym: "Gym 🏋️", home: "Home 🏠", both: "Gym + Home 🔄" };
  const dietMap: Record<string, string> = { any: "No Restriction", high_protein: "High Protein", vegetarian: "Vegetarian", vegan: "Vegan", keto: "Ketogenic", mediterranean: "Mediterranean", paleo: "Paleo" };

  const bmi = data.heightCm && data.weightKg ? (Number(data.weightKg) / ((Number(data.heightCm) / 100) ** 2)).toFixed(1) : "—";

  const sections = [
    { icon: "👤", title: "Personal", items: [["Name", data.name], ["Age / Gender", `${data.age} yrs · ${data.gender}`], ["BMI", bmi]] },
    { icon: "📏", title: "Body", items: [["Height / Weight", `${data.heightCm} cm · ${data.weightKg} kg`], ["Body Fat", data.bodyFatPercent ? `${data.bodyFatPercent}%` : "Not specified"], ["Target Weight", data.targetWeightKg ? `${data.targetWeightKg} kg` : "Not set"]] },
    { icon: "🎯", title: "Goal & Lifestyle", items: [["Goal", data.goal ? goalMap[data.goal] : "—"], ["Activity", data.activityLevel ? actMap[data.activityLevel] : "—"], ["Sleep / Stress", `${data.sleepHours ?? "—"} hrs · Stress ${data.stressLevel ?? "—"}/5`]] },
    { icon: "🏋️", title: "Training", items: [["Experience", data.experience ? expMap[data.experience] : "—"], ["Location", data.workoutLocation ? locMap[data.workoutLocation] : "—"], ["Frequency", `${data.daysPerWeek} days/week · ${data.preferredWorkoutTime ?? "Any time"}`]] },
    { icon: "🥗", title: "Diet & Health", items: [["Diet Style", data.dietStyle ? dietMap[data.dietStyle] : "—"], ["Injuries/Allergies", data.injuriesOrAllergies || "None"], ["Medical", data.medicalConditions || "None"]] },
  ];

  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-primary/5 border border-primary/20 p-4">
        <div className="flex items-center gap-2 mb-2">
          <Zap className="w-4 h-4 text-primary" />
          <p className="text-sm font-bold text-primary">Ready to generate your professional plan</p>
        </div>
        <p className="text-xs text-muted-foreground">Your personalised 4-week workout program, 7-day meal plan, supplement guide, and recovery protocol will be generated by AI and delivered as a professional PDF — typically in 20–35 seconds.</p>
      </div>

      <div className="space-y-3">
        {sections.map(sec => (
          <div key={sec.title} className="rounded-xl border border-border/30 overflow-hidden">
            <div className="bg-muted/30 px-4 py-2 flex items-center gap-2">
              <span>{sec.icon}</span>
              <p className="text-xs font-bold text-foreground/70 uppercase tracking-wide">{sec.title}</p>
            </div>
            <div className="divide-y divide-border/20">
              {sec.items.map(([k, v]) => (
                <div key={k as string} className="flex justify-between px-4 py-2 text-sm">
                  <span className="text-muted-foreground">{k}</span>
                  <span className="font-medium text-foreground text-right max-w-[55%]">{(v as string) || "—"}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Loading Screen ───────────────────────────────────────────────────────────
function LoadingScreen({ name }: { name?: string }) {
  const msgs = [
    { icon: "📊", text: "Calculating BMI, TDEE & metabolic rate…" },
    { icon: "🏋️", text: "Designing 4-week progressive workout plan…" },
    { icon: "📅", text: "Programming daily exercise sequences…" },
    { icon: "🥗", text: "Building personalised 7-day meal plan…" },
    { icon: "💊", text: "Selecting supplement & recovery protocol…" },
    { icon: "📄", text: "Rendering professional PDF…" },
  ];
  const [active, setActive] = useState(0);
  const [pct, setPct] = useState(0);

  useEffect(() => {
    const t1 = setInterval(() => setActive(p => Math.min(p + 1, msgs.length - 1)), 5000);
    const t2 = setInterval(() => setPct(p => Math.min(p + 1, 96)), 350);
    return () => { clearInterval(t1); clearInterval(t2); };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-10 text-center gap-6">
      <div className="relative w-24 h-24">
        <svg className="w-24 h-24 -rotate-90" viewBox="0 0 96 96">
          <circle cx="48" cy="48" r="40" fill="none" stroke="currentColor" strokeWidth="4" className="text-border/30" />
          <motion.circle cx="48" cy="48" r="40" fill="none" stroke="#C9A84C" strokeWidth="4"
            strokeLinecap="round" strokeDasharray={251.2}
            animate={{ strokeDashoffset: 251.2 * (1 - pct / 100) }}
            transition={{ ease: "linear", duration: 0.35 }} />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl font-bold text-primary">{pct}%</span>
        </div>
      </div>

      <div>
        <h3 className="text-xl font-bold mb-1">Building {name ? `${name}'s` : "your"} plan…</h3>
        <p className="text-sm text-muted-foreground">AI is working — takes 20–35 seconds</p>
      </div>

      <div className="w-full max-w-sm space-y-1.5">
        {msgs.map((m, i) => (
          <motion.div key={i} className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-all
            ${i < active ? "text-muted-foreground/50" : i === active ? "bg-primary/10 border border-primary/20 text-foreground font-medium" : "text-muted-foreground/30"}`}>
            <span className={`text-base ${i > active ? "opacity-30" : ""}`}>{m.icon}</span>
            <span>{m.text}</span>
            {i < active && <CheckCircle className="w-4 h-4 text-primary/50 ml-auto flex-shrink-0" />}
            {i === active && <Loader2 className="w-4 h-4 animate-spin text-primary ml-auto flex-shrink-0" />}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ─── Main ────────────────────────────────────────────────────────────────────
export default function PlannerPage() {
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [state, setState] = useState<PageState>("form");
  const [accumulated, setAccumulated] = useState<Partial<FormData>>({ daysPerWeek: 4, preferredWorkoutTime: "any" });
  const [errorMsg, setErrorMsg] = useState("");
  const topRef = useRef<HTMLDivElement>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const form = useForm<any>({
    resolver: zodResolver(schemas[step] ?? z.object({})),
    defaultValues: accumulated,
    mode: "onSubmit",
  });

  // re-initialise form values when step changes
  useEffect(() => {
    form.reset(accumulated);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  const scrollTop = () => topRef.current?.scrollIntoView({ behavior: "smooth" });

  const next = async () => {
    const ok = await form.trigger();
    if (!ok) return;
    const merged = { ...accumulated, ...form.getValues() } as Partial<FormData>;
    setAccumulated(merged);
    if (step < STEPS.length - 1) { setDir(1); setStep(s => s + 1); scrollTop(); }
    else await generate(merged as FormData);
  };

  const back = () => { setDir(-1); setStep(s => s - 1); scrollTop(); };

  const generate = async (data: FormData) => {
    setState("loading");
    try {
      const base = (import.meta.env.BASE_URL as string)?.replace(/\/$/, "") ?? "";
      const res = await fetch(`${base}/api/plan/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const e = await res.json().catch(() => ({ error: "Server error" })) as { error?: string };
        throw new Error(e.error ?? `Error ${res.status}`);
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = `plan-${(data.name || "my").toLowerCase().replace(/\s+/g, "-")}.pdf`;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 30000);
      setState("success");
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : "Something went wrong");
      setState("error");
    }
  };

  const restart = () => {
    setStep(0); setDir(1); setState("form"); setErrorMsg("");
    setAccumulated({ daysPerWeek: 4, preferredWorkoutTime: "any" });
    form.reset({ daysPerWeek: 4, preferredWorkoutTime: "any" });
    scrollTop();
  };

  const slide = {
    enter: (d: number) => ({ x: d > 0 ? 40 : -40, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit:  (d: number) => ({ x: d > 0 ? -40 : 40, opacity: 0 }),
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col" ref={topRef}>
      {/* ── Header ── */}
      <header className="sticky top-0 z-30 bg-background/90 backdrop-blur border-b border-border/40">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="bg-primary text-primary-foreground p-1.5 rounded-lg">
              <Dumbbell className="w-4 h-4" />
            </div>
            <div className="leading-none">
              <p className="font-bold text-sm">AI Gym Planner</p>
              <p className="text-[10px] text-muted-foreground">by Tarik Islam</p>
            </div>
          </div>
          {state === "form" && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Shield className="w-3.5 h-3.5" />
              Free · No account needed
            </div>
          )}
        </div>
      </header>

      <div className="flex-1 max-w-2xl mx-auto w-full px-4 py-6 md:py-8">
        {/* ── Loading ── */}
        {state === "loading" && <LoadingScreen name={accumulated.name} />}

        {/* ── Success ── */}
        {state === "success" && (
          <div className="flex flex-col items-center text-center py-16 gap-6">
            <motion.div initial={{ scale: 0, rotate: -15 }} animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 14 }}
              className="w-24 h-24 rounded-full bg-primary/15 border-2 border-primary flex items-center justify-center">
              <Download className="w-10 h-10 text-primary" />
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <h2 className="text-2xl font-bold mb-2">Your plan is downloading! 🎉</h2>
              <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                Check your Downloads folder, {accumulated.name}. Your professional PDF includes your workout program, meal plan, supplement guide, and recovery protocol.
              </p>
            </motion.div>
            <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
              {[
                { icon: "🏋️", l: "4-Week Workout Plan" },
                { icon: "🥗", l: "7-Day Meal Plan" },
                { icon: "💊", l: "Supplement Guide" },
                { icon: "😴", l: "Recovery Protocol" },
              ].map(({ icon, l }) => (
                <div key={l} className="rounded-xl bg-muted/30 border border-border/30 p-3 flex items-center gap-2 text-sm">
                  <span>{icon}</span><span className="font-medium text-xs">{l}</span>
                </div>
              ))}
            </div>
            <Button onClick={restart} variant="outline" className="gap-2 rounded-full px-6">
              <RotateCcw className="w-4 h-4" /> Generate Another Plan
            </Button>
          </div>
        )}

        {/* ── Error ── */}
        {state === "error" && (
          <div className="flex flex-col items-center text-center py-16 gap-5">
            <div className="w-20 h-20 rounded-full bg-red-500/10 border-2 border-red-500/30 flex items-center justify-center">
              <AlertCircle className="w-9 h-9 text-red-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold mb-1">Generation failed</h2>
              <p className="text-muted-foreground text-sm max-w-xs">{errorMsg}</p>
            </div>
            <Button onClick={restart} variant="outline" className="gap-2 rounded-full px-6">
              <RotateCcw className="w-4 h-4" /> Try Again
            </Button>
          </div>
        )}

        {/* ── Form ── */}
        {state === "form" && (
          <>
            {/* Step tracker */}
            <div className="mb-6">
              {/* Step pills */}
              <div className="flex items-center gap-1 mb-3 overflow-x-auto pb-1 scrollbar-none">
                {STEPS.map((s, i) => {
                  const Icon = s.icon;
                  const done = i < step;
                  const active = i === step;
                  return (
                    <div key={i} className="flex items-center gap-1 flex-shrink-0">
                      <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all
                        ${done ? "bg-primary/20 text-primary" : active ? "bg-primary text-primary-foreground shadow-sm shadow-primary/30" : "bg-muted/40 text-muted-foreground"}`}>
                        {done ? <CheckCircle className="w-3 h-3" /> : <Icon className="w-3 h-3" />}
                        <span className="hidden sm:inline">{s.short}</span>
                      </div>
                      {i < STEPS.length - 1 && <div className={`h-0.5 w-3 rounded-full transition-all ${i < step ? "bg-primary" : "bg-border/30"}`} />}
                    </div>
                  );
                })}
              </div>
              {/* Progress bar */}
              <div className="h-1 bg-border/30 rounded-full overflow-hidden">
                <motion.div className="h-full bg-primary rounded-full"
                  animate={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
                  transition={{ ease: "easeOut", duration: 0.3 }} />
              </div>
            </div>

            {/* Step header */}
            <div className="mb-5">
              <div className="flex items-center gap-2 mb-1">
                {(() => { const Icon = STEPS[step].icon; return <Icon className={`w-5 h-5 ${STEPS[step].color}`} />; })()}
                <h1 className="text-xl font-bold">{STEPS[step].title}</h1>
                <span className="ml-auto text-xs text-muted-foreground">{step + 1}/{STEPS.length}</span>
              </div>
            </div>

            {/* Card */}
            <div className="bg-card/50 border border-border/40 rounded-2xl p-5 md:p-6">
              <AnimatePresence mode="wait" custom={dir}>
                <motion.div key={step} custom={dir} variants={slide}
                  initial="enter" animate="center" exit="exit"
                  transition={{ duration: 0.18, ease: "easeInOut" }}>
                  <form onSubmit={e => { e.preventDefault(); next(); }}>
                    {step === 0 && <StepPersonal form={form} />}
                    {step === 1 && <StepBody form={form} accumulated={accumulated} />}
                    {step === 2 && <StepGoal form={form} accumulated={accumulated} />}
                    {step === 3 && <StepTraining form={form} />}
                    {step === 4 && <StepDiet form={form} />}
                    {step === 5 && <StepReview data={accumulated} />}

                    <div className="flex gap-3 mt-7">
                      {step > 0 && (
                        <Button type="button" variant="outline" onClick={back}
                          className="flex-1 h-12 rounded-xl gap-2 font-semibold">
                          <ChevronLeft className="w-4 h-4" /> Back
                        </Button>
                      )}
                      <Button type="submit"
                        className="flex-1 h-12 rounded-xl font-bold gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-md shadow-primary/20">
                        {step === STEPS.length - 1 ? (
                          <><Flame className="w-4 h-4" /> Generate My Plan</>
                        ) : (
                          <>Continue <ChevronRight className="w-4 h-4" /></>
                        )}
                      </Button>
                    </div>
                  </form>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Trust bar */}
            <div className="flex flex-wrap items-center justify-center gap-4 mt-5 text-xs text-muted-foreground/60">
              {[
                { icon: Heart, t: "Personalised by AI" },
                { icon: Shield, t: "Private & secure" },
                { icon: Download, t: "Instant PDF" },
                { icon: Zap, t: "Free forever" },
              ].map(({ icon: Icon, t }) => (
                <div key={t} className="flex items-center gap-1.5">
                  <Icon className="w-3.5 h-3.5" />{t}
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-border/30 py-4 text-center text-xs text-muted-foreground/40">
        Designed & Developed by{" "}
        <a href="https://tarikislam.in" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Tarik Islam</a>
      </footer>
    </div>
  );
}
