import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm, UseFormReturn, FieldValues } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import {
  ChevronRight, ChevronLeft, Dumbbell, User, Target,
  Settings, CheckCircle, Loader2, Download, RotateCcw,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// ─── Types ────────────────────────────────────────────────────────────────────

interface FormData {
  name: string;
  age: number;
  gender: "male" | "female" | "other";
  heightCm: number;
  weightKg: number;
  goal: "weight_loss" | "muscle_gain" | "maintain" | "recomposition";
  activityLevel: "sedentary" | "light" | "moderate" | "active" | "very_active";
  experience: "beginner" | "intermediate" | "advanced";
  workoutLocation: "home" | "gym";
  daysPerWeek: number;
  dietStyle: "any" | "vegetarian" | "vegan" | "keto" | "high_protein";
  injuriesOrAllergies: string;
}

// ─── Validation schemas ───────────────────────────────────────────────────────

const step1Schema = z.object({
  name: z.string().min(1, "Name is required"),
  age: z.coerce.number().int().min(10, "Must be at least 10").max(100, "Must be at most 100"),
  gender: z.enum(["male", "female", "other"]),
  heightCm: z.coerce.number().min(50, "Enter height in cm").max(250),
  weightKg: z.coerce.number().min(20, "Enter weight in kg").max(300),
});

const step2Schema = z.object({
  goal: z.enum(["weight_loss", "muscle_gain", "maintain", "recomposition"]),
  activityLevel: z.enum(["sedentary", "light", "moderate", "active", "very_active"]),
  experience: z.enum(["beginner", "intermediate", "advanced"]),
});

const step3Schema = z.object({
  workoutLocation: z.enum(["home", "gym"]),
  daysPerWeek: z.coerce.number().int().min(3).max(6),
  dietStyle: z.enum(["any", "vegetarian", "vegan", "keto", "high_protein"]),
  injuriesOrAllergies: z.string().optional(),
});

const schemas = [step1Schema, step2Schema, step3Schema];

// ─── Option card ─────────────────────────────────────────────────────────────

function OptionCard({
  value,
  selected,
  onClick,
  label,
  description,
  emoji,
}: {
  value: string;
  selected: boolean;
  onClick: () => void;
  label: string;
  description?: string;
  emoji?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 ${
        selected
          ? "border-primary bg-primary/10 text-foreground"
          : "border-border/50 bg-background/40 hover:border-primary/50 hover:bg-primary/5"
      }`}
    >
      <div className="flex items-center gap-3">
        {emoji && <span className="text-2xl">{emoji}</span>}
        <div className="flex-1">
          <div className={`font-semibold text-sm ${selected ? "text-primary" : "text-foreground"}`}>
            {label}
          </div>
          {description && (
            <div className="text-xs text-muted-foreground mt-0.5">{description}</div>
          )}
        </div>
        {selected && (
          <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
        )}
      </div>
    </button>
  );
}

// ─── Step components ──────────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyForm = UseFormReturn<any>;

function Step1({ form }: { form: AnyForm }) {
  const { register, watch, setValue, formState: { errors } } = form;
  const gender = watch("gender");

  return (
    <div className="space-y-5">
      <div>
        <Label htmlFor="name" className="text-sm font-medium text-foreground mb-2 block">
          Full Name
        </Label>
        <Input
          id="name"
          {...register("name")}
          placeholder="e.g. Alex Johnson"
          className="h-12 bg-background/60 border-border/50 focus:border-primary text-base"
          style={{ fontSize: "16px" }}
        />
        {errors.name && (
          <p className="text-red-400 text-xs mt-1">{String(errors.name.message)}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="age" className="text-sm font-medium text-foreground mb-2 block">Age</Label>
          <Input
            id="age"
            type="number"
            {...register("age")}
            placeholder="25"
            className="h-12 bg-background/60 border-border/50 focus:border-primary"
            style={{ fontSize: "16px" }}
          />
          {errors.age && <p className="text-red-400 text-xs mt-1">{String(errors.age.message)}</p>}
        </div>

        <div>
          <Label className="text-sm font-medium text-foreground mb-2 block">Gender</Label>
          <div className="grid grid-cols-3 gap-2">
            {(["male", "female", "other"] as const).map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setValue("gender", g)}
                className={`h-12 rounded-lg border-2 text-xs font-semibold capitalize transition-all ${
                  gender === g
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border/50 text-muted-foreground hover:border-primary/50"
                }`}
              >
                {g}
              </button>
            ))}
          </div>
          {errors.gender && <p className="text-red-400 text-xs mt-1">{String(errors.gender.message)}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="heightCm" className="text-sm font-medium text-foreground mb-2 block">
            Height (cm)
          </Label>
          <Input
            id="heightCm"
            type="number"
            {...register("heightCm")}
            placeholder="175"
            className="h-12 bg-background/60 border-border/50 focus:border-primary"
            style={{ fontSize: "16px" }}
          />
          {errors.heightCm && <p className="text-red-400 text-xs mt-1">{String(errors.heightCm.message)}</p>}
        </div>

        <div>
          <Label htmlFor="weightKg" className="text-sm font-medium text-foreground mb-2 block">
            Weight (kg)
          </Label>
          <Input
            id="weightKg"
            type="number"
            {...register("weightKg")}
            placeholder="75"
            className="h-12 bg-background/60 border-border/50 focus:border-primary"
            style={{ fontSize: "16px" }}
          />
          {errors.weightKg && <p className="text-red-400 text-xs mt-1">{String(errors.weightKg.message)}</p>}
        </div>
      </div>
    </div>
  );
}

function Step2({ form }: { form: AnyForm }) {
  const { watch, setValue, formState: { errors } } = form;
  const goal = watch("goal");
  const activityLevel = watch("activityLevel");
  const experience = watch("experience");

  const goals = [
    { value: "weight_loss", label: "Weight Loss", description: "Burn fat, lean out", emoji: "🔥" },
    { value: "muscle_gain", label: "Muscle Gain", description: "Build mass and strength", emoji: "💪" },
    { value: "maintain", label: "Maintain", description: "Stay at current weight", emoji: "⚖️" },
    { value: "recomposition", label: "Recomposition", description: "Lose fat, gain muscle", emoji: "🔄" },
  ];
  const activities = [
    { value: "sedentary", label: "Sedentary", description: "Office job, little movement" },
    { value: "light", label: "Light", description: "1-3 days/week light exercise" },
    { value: "moderate", label: "Moderate", description: "3-5 days/week exercise" },
    { value: "active", label: "Active", description: "6-7 days/week hard exercise" },
    { value: "very_active", label: "Very Active", description: "Physical job + training" },
  ];
  const levels = [
    { value: "beginner", label: "Beginner", description: "< 1 year training", emoji: "🌱" },
    { value: "intermediate", label: "Intermediate", description: "1-3 years training", emoji: "⚡" },
    { value: "advanced", label: "Advanced", description: "3+ years training", emoji: "🏆" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <Label className="text-sm font-medium text-foreground mb-3 block">Primary Goal</Label>
        <div className="grid grid-cols-2 gap-3">
          {goals.map((g) => (
            <OptionCard key={g.value} value={g.value} selected={goal === g.value}
              onClick={() => setValue("goal", g.value)} label={g.label}
              description={g.description} emoji={g.emoji} />
          ))}
        </div>
        {errors.goal && <p className="text-red-400 text-xs mt-1">{String(errors.goal.message)}</p>}
      </div>

      <div>
        <Label className="text-sm font-medium text-foreground mb-3 block">Activity Level</Label>
        <div className="space-y-2">
          {activities.map((a) => (
            <OptionCard key={a.value} value={a.value} selected={activityLevel === a.value}
              onClick={() => setValue("activityLevel", a.value)} label={a.label}
              description={a.description} />
          ))}
        </div>
        {errors.activityLevel && <p className="text-red-400 text-xs mt-1">{String(errors.activityLevel.message)}</p>}
      </div>

      <div>
        <Label className="text-sm font-medium text-foreground mb-3 block">Experience Level</Label>
        <div className="grid grid-cols-3 gap-3">
          {levels.map((l) => (
            <OptionCard key={l.value} value={l.value} selected={experience === l.value}
              onClick={() => setValue("experience", l.value)} label={l.label}
              description={l.description} emoji={l.emoji} />
          ))}
        </div>
        {errors.experience && <p className="text-red-400 text-xs mt-1">{String(errors.experience.message)}</p>}
      </div>
    </div>
  );
}

function Step3({ form }: { form: AnyForm }) {
  const { register, watch, setValue, formState: { errors } } = form;
  const workoutLocation = watch("workoutLocation");
  const dietStyle = watch("dietStyle");
  const daysPerWeek = watch("daysPerWeek");

  const diets = [
    { value: "any", label: "No Restrictions", emoji: "🍽️" },
    { value: "vegetarian", label: "Vegetarian", emoji: "🥗" },
    { value: "vegan", label: "Vegan", emoji: "🌿" },
    { value: "keto", label: "Keto", emoji: "🥑" },
    { value: "high_protein", label: "High Protein", emoji: "🥩" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <Label className="text-sm font-medium text-foreground mb-3 block">Workout Location</Label>
        <div className="grid grid-cols-2 gap-3">
          <OptionCard value="gym" selected={workoutLocation === "gym"}
            onClick={() => setValue("workoutLocation", "gym")} label="Gym"
            description="Full equipment access" emoji="🏋️" />
          <OptionCard value="home" selected={workoutLocation === "home"}
            onClick={() => setValue("workoutLocation", "home")} label="Home"
            description="Bodyweight & minimal gear" emoji="🏠" />
        </div>
        {errors.workoutLocation && <p className="text-red-400 text-xs mt-1">{String(errors.workoutLocation.message)}</p>}
      </div>

      <div>
        <Label className="text-sm font-medium text-foreground mb-3 block">
          Days Per Week: <span className="text-primary font-bold">{daysPerWeek || 4}</span>
        </Label>
        <div className="flex gap-2">
          {[3, 4, 5, 6].map((d) => (
            <button key={d} type="button" onClick={() => setValue("daysPerWeek", d)}
              className={`flex-1 h-12 rounded-xl border-2 font-bold text-lg transition-all ${
                Number(daysPerWeek) === d
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border/50 text-muted-foreground hover:border-primary/50"
              }`}
            >{d}</button>
          ))}
        </div>
        {errors.daysPerWeek && <p className="text-red-400 text-xs mt-1">{String(errors.daysPerWeek.message)}</p>}
      </div>

      <div>
        <Label className="text-sm font-medium text-foreground mb-3 block">Diet Style</Label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {diets.map((d) => (
            <OptionCard key={d.value} value={d.value} selected={dietStyle === d.value}
              onClick={() => setValue("dietStyle", d.value)} label={d.label} emoji={d.emoji} />
          ))}
        </div>
        {errors.dietStyle && <p className="text-red-400 text-xs mt-1">{String(errors.dietStyle.message)}</p>}
      </div>

      <div>
        <Label htmlFor="injuriesOrAllergies" className="text-sm font-medium text-foreground mb-2 block">
          Injuries or Allergies <span className="text-muted-foreground font-normal">(optional)</span>
        </Label>
        <Input
          id="injuriesOrAllergies"
          {...register("injuriesOrAllergies")}
          placeholder="e.g. bad knees, lactose intolerant"
          className="h-12 bg-background/60 border-border/50 focus:border-primary"
          style={{ fontSize: "16px" }}
        />
      </div>
    </div>
  );
}

function Step4Review({ data }: { data: Partial<FormData> }) {
  const goalLabels: Record<string, string> = {
    weight_loss: "Weight Loss", muscle_gain: "Muscle Gain",
    maintain: "Maintain Weight", recomposition: "Body Recomposition",
  };
  const activityLabels: Record<string, string> = {
    sedentary: "Sedentary", light: "Lightly Active", moderate: "Moderately Active",
    active: "Active", very_active: "Very Active",
  };
  const dietLabels: Record<string, string> = {
    any: "No Restrictions", vegetarian: "Vegetarian", vegan: "Vegan",
    keto: "Keto", high_protein: "High Protein",
  };

  const rows = [
    { label: "Name", value: data.name ?? "—" },
    { label: "Age", value: data.age ? `${data.age} years` : "—" },
    { label: "Gender", value: data.gender ? data.gender.charAt(0).toUpperCase() + data.gender.slice(1) : "—" },
    { label: "Height", value: data.heightCm ? `${data.heightCm} cm` : "—" },
    { label: "Weight", value: data.weightKg ? `${data.weightKg} kg` : "—" },
    { label: "Goal", value: data.goal ? (goalLabels[data.goal] ?? data.goal) : "—" },
    { label: "Activity Level", value: data.activityLevel ? (activityLabels[data.activityLevel] ?? data.activityLevel) : "—" },
    { label: "Experience", value: data.experience ? data.experience.charAt(0).toUpperCase() + data.experience.slice(1) : "—" },
    { label: "Workout Location", value: data.workoutLocation ? data.workoutLocation.charAt(0).toUpperCase() + data.workoutLocation.slice(1) : "—" },
    { label: "Days Per Week", value: data.daysPerWeek ? `${data.daysPerWeek} days` : "—" },
    { label: "Diet Style", value: data.dietStyle ? (dietLabels[data.dietStyle] ?? data.dietStyle) : "—" },
    ...(data.injuriesOrAllergies ? [{ label: "Injuries / Allergies", value: data.injuriesOrAllergies }] : []),
  ];

  return (
    <div className="space-y-4">
      <p className="text-muted-foreground text-sm">
        Review your details below. Once you click "Generate My Plan", our AI will create your personalised workout + diet plan and download it as a PDF.
      </p>
      <div className="rounded-xl border border-border/50 overflow-hidden">
        {rows.map((row, i) => (
          <div key={row.label} className={`flex items-center justify-between px-4 py-3 ${i % 2 === 0 ? "bg-background/40" : "bg-background/20"}`}>
            <span className="text-muted-foreground text-sm">{row.label}</span>
            <span className="text-foreground text-sm font-medium">{row.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Loading screen ───────────────────────────────────────────────────────────

function LoadingScreen() {
  const steps = [
    "Analysing your body metrics...",
    "Calculating TDEE & macro targets...",
    "Building your 4-week workout programme...",
    "Crafting your personalised meal plan...",
    "Adding supplement recommendations...",
    "Designing your branded PDF...",
  ];
  const [currentStep, setCurrentStep] = useState(0);

  useState(() => {
    const interval = setInterval(() => {
      setCurrentStep((s) => (s < steps.length - 1 ? s + 1 : s));
    }, 2500);
    return () => clearInterval(interval);
  });

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
      <motion.div
        className="relative w-24 h-24 mb-8"
        animate={{ rotate: 360 }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
      >
        <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
        <div className="absolute inset-0 rounded-full border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent" />
        <div className="absolute inset-4 flex items-center justify-center">
          <Dumbbell className="w-8 h-8 text-primary" />
        </div>
      </motion.div>

      <h2 className="text-2xl font-bold text-foreground mb-2">AI is building your plan</h2>
      <p className="text-muted-foreground mb-8 text-sm">This takes about 15–30 seconds</p>

      <div className="space-y-2 w-full max-w-sm">
        {steps.map((step, i) => (
          <motion.div
            key={i}
            className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-500 ${
              i < currentStep ? "bg-primary/10 text-primary" :
              i === currentStep ? "bg-primary/20 text-primary" :
              "text-muted-foreground/40"
            }`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            {i < currentStep ? <CheckCircle className="w-4 h-4 flex-shrink-0" /> :
             i === currentStep ? <Loader2 className="w-4 h-4 flex-shrink-0 animate-spin" /> :
             <div className="w-4 h-4 rounded-full border border-current flex-shrink-0" />}
            <span className="text-sm font-medium">{step}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ─── Success screen ───────────────────────────────────────────────────────────

function SuccessScreen({ name, onRestart }: { name: string; onRestart: () => void }) {
  const [, navigate] = useLocation();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
        className="w-24 h-24 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center mb-6"
      >
        <Download className="w-10 h-10 text-primary" />
      </motion.div>

      <motion.h2 className="text-3xl font-bold text-foreground mb-2"
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        Your plan is downloading!
      </motion.h2>
      <motion.p className="text-muted-foreground mb-2 max-w-md"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
        {name}, your personalised AI fitness plan has been generated. Your PDF download should start automatically.
      </motion.p>
      <motion.p className="text-muted-foreground/60 text-sm mb-10"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
        Check your Downloads folder if it doesn't appear.
      </motion.p>

      <motion.div className="flex flex-col sm:flex-row gap-3"
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
        <Button onClick={onRestart} variant="outline"
          className="gap-2 rounded-full border-border/50 hover:border-primary/50">
          <RotateCcw className="w-4 h-4" /> Generate Another Plan
        </Button>
        <Button onClick={() => navigate("/")}
          className="gap-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
          Back to Home <ChevronRight className="w-4 h-4" />
        </Button>
      </motion.div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

const STEPS = [
  { title: "About You", icon: User, description: "Basic personal information" },
  { title: "Your Goal", icon: Target, description: "What you want to achieve" },
  { title: "Preferences", icon: Settings, description: "Training & diet style" },
  { title: "Review", icon: CheckCircle, description: "Confirm and generate" },
];

type PageState = "form" | "loading" | "success" | "error";

export default function GetPlanPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [pageState, setPageState] = useState<PageState>("form");
  const [allData, setAllData] = useState<Partial<FormData>>({});
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [, navigate] = useLocation();

  const form = useForm({
    resolver: zodResolver(schemas[currentStep] ?? z.object({})),
    defaultValues: { daysPerWeek: 4, ...allData } as FieldValues,
    mode: "onSubmit",
  });

  const handleNext = async () => {
    const valid = await form.trigger();
    if (!valid) return;
    const values = form.getValues();
    const merged = { ...allData, ...values };
    setAllData(merged);
    if (currentStep < 3) {
      setDirection(1);
      setCurrentStep((s) => s + 1);
    } else {
      await handleGenerate(merged as FormData);
    }
  };

  const handleBack = () => {
    setDirection(-1);
    setCurrentStep((s) => s - 1);
  };

  const handleGenerate = async (data: FormData) => {
    setPageState("loading");
    setErrorMsg("");
    try {
      const baseUrl = (import.meta.env.BASE_URL as string)?.replace(/\/$/, "") || "";
      const response = await fetch(`${baseUrl}/api/plan/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const errData = await response.json().catch(() => ({ error: "Unknown error" })) as { error?: string };
        throw new Error(errData.error ?? `Error ${response.status}`);
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `fitness-plan-${data.name.toLowerCase().replace(/\s+/g, "-")}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 10000);
      setPageState("success");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong");
      setPageState("error");
    }
  };

  const handleRestart = () => {
    setCurrentStep(0);
    setDirection(1);
    setAllData({});
    setPageState("form");
    setErrorMsg("");
    form.reset({ daysPerWeek: 4 });
  };

  if (pageState === "loading") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="w-full max-w-lg"><LoadingScreen /></div>
      </div>
    );
  }

  if (pageState === "success") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="w-full max-w-lg">
          <SuccessScreen name={(allData.name as string) || "Champion"} onRestart={handleRestart} />
        </div>
      </div>
    );
  }

  if (pageState === "error") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="w-full max-w-lg text-center">
          <div className="w-20 h-20 rounded-full bg-red-500/10 border-2 border-red-500/50 flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Generation Failed</h2>
          <p className="text-muted-foreground mb-2">{errorMsg}</p>
          <p className="text-muted-foreground/60 text-sm mb-8">Please try again in a moment.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={handleRestart} variant="outline" className="gap-2 rounded-full">
              <RotateCcw className="w-4 h-4" /> Try Again
            </Button>
            <Button onClick={() => navigate("/")} className="gap-2 rounded-full bg-primary text-primary-foreground">
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const stepVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-4 md:px-6 py-4 border-b border-border/50">
        <button onClick={() => navigate("/")}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
          <div className="bg-primary text-primary-foreground p-1.5 rounded-lg">
            <Dumbbell className="w-4 h-4" />
          </div>
          <span className="font-bold text-sm hidden sm:inline">Tarik Islam AI Gym Planner</span>
        </button>
        <div className="text-sm text-muted-foreground">Step {currentStep + 1} of {STEPS.length}</div>
      </header>

      {/* Progress bar */}
      <div className="h-1 bg-border/30">
        <motion.div className="h-full bg-primary" initial={false}
          animate={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
          transition={{ duration: 0.4, ease: "easeInOut" }} />
      </div>

      <div className="flex-1 flex items-start justify-center px-4 py-8 overflow-y-auto">
        <div className="w-full max-w-lg">
          {/* Step indicators */}
          <div className="flex items-center justify-between mb-8">
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              const isCompleted = i < currentStep;
              const isActive = i === currentStep;
              return (
                <div key={i} className="flex flex-col items-center flex-1">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                    isCompleted ? "bg-primary border-primary text-primary-foreground" :
                    isActive ? "border-primary text-primary bg-primary/10" :
                    "border-border/50 text-muted-foreground/40"
                  }`}>
                    {isCompleted ? <CheckCircle className="w-5 h-5" /> : <Icon className="w-4 h-4" />}
                  </div>
                  <span className={`text-xs mt-1.5 font-medium hidden sm:block ${
                    isActive ? "text-primary" : isCompleted ? "text-foreground/70" : "text-muted-foreground/40"
                  }`}>
                    {step.title}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Step content card */}
          <div className="bg-card/50 border border-border/50 rounded-2xl p-6 md:p-8">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={currentStep}
                custom={direction}
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.25, ease: "easeInOut" }}
              >
                <h2 className="text-xl font-bold text-foreground mb-1">{STEPS[currentStep].title}</h2>
                <p className="text-muted-foreground text-sm mb-6">{STEPS[currentStep].description}</p>

                <form onSubmit={(e) => { e.preventDefault(); handleNext(); }}>
                  {currentStep === 0 && <Step1 form={form} />}
                  {currentStep === 1 && <Step2 form={form} />}
                  {currentStep === 2 && <Step3 form={form} />}
                  {currentStep === 3 && <Step4Review data={allData} />}

                  <div className="flex gap-3 mt-8">
                    {currentStep > 0 && (
                      <Button type="button" variant="outline" onClick={handleBack}
                        className="flex-1 h-12 rounded-xl border-border/50 gap-2">
                        <ChevronLeft className="w-4 h-4" /> Back
                      </Button>
                    )}
                    <Button type="submit"
                      className="flex-1 h-12 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 gap-2 font-bold text-base">
                      {currentStep === 3 ? (
                        <>Generate My Plan <Dumbbell className="w-4 h-4" /></>
                      ) : (
                        <>Continue <ChevronRight className="w-4 h-4" /></>
                      )}
                    </Button>
                  </div>
                </form>
              </motion.div>
            </AnimatePresence>
          </div>

          <p className="text-center text-xs text-muted-foreground/50 mt-6">
            100% free · No account required · PDF downloads instantly
          </p>
        </div>
      </div>
    </div>
  );
}
