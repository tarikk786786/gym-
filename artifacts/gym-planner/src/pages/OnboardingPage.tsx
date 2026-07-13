import { useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useUpdateProfile } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQueryClient } from "@tanstack/react-query";
import { getGetProfileQueryKey } from "@workspace/api-client-react";
import { Dumbbell, Activity, Target, Utensils, Clock, Home, Flame } from "lucide-react";

const onboardingSchema = z.object({
  fullName: z.string().min(1, "Name is required"),
  age: z.coerce.number().min(13, "Must be at least 13").max(100, "Invalid age"),
  gender: z.string().min(1, "Gender is required"),
  heightCm: z.coerce.number().min(50).max(300, "Invalid height"),
  weightKg: z.coerce.number().min(20).max(300, "Invalid weight"),
  goal: z.string().min(1, "Goal is required"),
  activityLevel: z.string().min(1, "Activity level is required"),
  workoutExperience: z.string().min(1, "Experience is required"),
  foodPreference: z.string().min(1, "Food preference is required"),
  gymAvailability: z.boolean(),
  workoutDaysPerWeek: z.number().min(1).max(7),
  preferredWorkoutTime: z.string().min(1, "Preferred time is required"),
  medicalConditions: z.string().optional(),
  injuries: z.string().optional(),
  allergies: z.string().optional(),
});

type OnboardingData = z.infer<typeof onboardingSchema>;

const TOTAL_STEPS = 7;

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const updateProfile = useUpdateProfile();

  const form = useForm<OnboardingData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      fullName: "",
      age: 25,
      gender: "",
      heightCm: 175,
      weightKg: 70,
      goal: "",
      activityLevel: "",
      workoutExperience: "",
      foodPreference: "",
      gymAvailability: true,
      workoutDaysPerWeek: 4,
      preferredWorkoutTime: "",
      medicalConditions: "",
      injuries: "",
      allergies: "",
    },
    mode: "onChange",
  });

  const { watch, trigger, getValues, setValue } = form;
  const values = watch();

  const handleNext = async () => {
    let fieldsToValidate: (keyof OnboardingData)[] = [];
    switch (step) {
      case 1: fieldsToValidate = ["fullName", "age", "gender"]; break;
      case 2: fieldsToValidate = ["heightCm", "weightKg"]; break;
      case 3: fieldsToValidate = ["goal", "activityLevel"]; break;
      case 4: fieldsToValidate = ["workoutExperience", "foodPreference"]; break;
      case 5: fieldsToValidate = ["gymAvailability", "workoutDaysPerWeek", "preferredWorkoutTime"]; break;
      case 6: fieldsToValidate = ["medicalConditions", "injuries", "allergies"]; break;
    }

    const isValid = await trigger(fieldsToValidate);
    if (isValid) {
      setStep((s) => Math.min(s + 1, TOTAL_STEPS));
    }
  };

  const handleBack = () => setStep((s) => Math.max(s - 1, 1));

  const onSubmit = async (data: OnboardingData) => {
    try {
      await updateProfile.mutateAsync({
        data: {
          ...data,
          onboardingCompleted: true,
        }
      });
      queryClient.invalidateQueries({ queryKey: getGetProfileQueryKey() });
      setLocation("/dashboard");
    } catch (error) {
      console.error("Failed to complete onboarding", error);
    }
  };

  const slideVariants = {
    initial: { opacity: 0, x: 50 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 },
  };

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col items-center justify-center p-4">
      {/* Background layer */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 -left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] mix-blend-screen"></div>
        <div className="absolute bottom-1/4 -right-1/4 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[150px] mix-blend-screen"></div>
      </div>

      <div className="w-full max-w-2xl relative z-10 glass-panel rounded-3xl p-8 shadow-2xl">
        {/* Header & Progress */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-display font-bold text-white">Setup Your Profile</h1>
            <span className="text-sm font-medium text-primary">Step {step} of {TOTAL_STEPS}</span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)}>
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              variants={slideVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="min-h-[300px]"
            >
              {step === 1 && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-white mb-4">About You</h2>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input id="fullName" {...form.register("fullName")} className="bg-black/50 border-white/10" placeholder="John Doe" />
                      {form.formState.errors.fullName && <p className="text-red-500 text-sm">{form.formState.errors.fullName.message}</p>}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="age">Age</Label>
                        <Input id="age" type="number" {...form.register("age")} className="bg-black/50 border-white/10" />
                        {form.formState.errors.age && <p className="text-red-500 text-sm">{form.formState.errors.age.message}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="gender">Gender</Label>
                        <Select onValueChange={(v) => setValue("gender", v)} defaultValue={values.gender}>
                          <SelectTrigger className="bg-black/50 border-white/10">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Male">Male</SelectItem>
                            <SelectItem value="Female">Female</SelectItem>
                            <SelectItem value="Non-binary">Non-binary</SelectItem>
                            <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                          </SelectContent>
                        </Select>
                        {form.formState.errors.gender && <p className="text-red-500 text-sm">{form.formState.errors.gender.message}</p>}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-white mb-4">Your Body Metrics</h2>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="heightCm">Height (cm)</Label>
                      <Input id="heightCm" type="number" {...form.register("heightCm")} className="bg-black/50 border-white/10 text-lg py-6" />
                      {form.formState.errors.heightCm && <p className="text-red-500 text-sm">{form.formState.errors.heightCm.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="weightKg">Weight (kg)</Label>
                      <Input id="weightKg" type="number" {...form.register("weightKg")} className="bg-black/50 border-white/10 text-lg py-6" />
                      {form.formState.errors.weightKg && <p className="text-red-500 text-sm">{form.formState.errors.weightKg.message}</p>}
                    </div>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-white mb-4">Your Goals & Activity</h2>
                  <div className="space-y-4">
                    <Label>Primary Goal</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {["Weight Loss", "Muscle Gain", "Maintain", "Body Recomposition", "Strength", "Endurance"].map((g) => (
                        <div 
                          key={g}
                          onClick={() => setValue("goal", g)}
                          className={`p-4 rounded-xl border cursor-pointer transition-all ${values.goal === g ? 'border-primary bg-primary/10 text-primary' : 'border-white/10 bg-black/30 text-muted-foreground hover:border-white/30'}`}
                        >
                          <span className="font-medium text-sm block text-center">{g}</span>
                        </div>
                      ))}
                    </div>
                    {form.formState.errors.goal && <p className="text-red-500 text-sm">{form.formState.errors.goal.message}</p>}
                  </div>

                  <div className="space-y-4 pt-4 border-t border-white/10">
                    <Label>Current Activity Level</Label>
                    <RadioGroup value={values.activityLevel} onValueChange={(v) => setValue("activityLevel", v)} className="space-y-2">
                      {[
                        { id: "Sedentary", desc: "Little to no exercise" },
                        { id: "Lightly Active", desc: "Light exercise 1-3 days/week" },
                        { id: "Moderately Active", desc: "Moderate exercise 3-5 days/week" },
                        { id: "Very Active", desc: "Hard exercise 6-7 days/week" },
                        { id: "Athlete", desc: "Very hard exercise & physical job" }
                      ].map((level) => (
                        <div key={level.id} className="flex items-center space-x-3 p-3 rounded-xl border border-white/10 bg-black/30">
                          <RadioGroupItem value={level.id} id={level.id} />
                          <Label htmlFor={level.id} className="cursor-pointer flex-1">
                            <span className="block font-medium text-white">{level.id}</span>
                            <span className="text-xs text-muted-foreground">{level.desc}</span>
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                    {form.formState.errors.activityLevel && <p className="text-red-500 text-sm">{form.formState.errors.activityLevel.message}</p>}
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-white mb-4">Experience & Preferences</h2>
                  <div className="space-y-4">
                    <Label>Workout Experience</Label>
                    <div className="grid grid-cols-3 gap-3">
                      {["Beginner", "Intermediate", "Advanced"].map((exp) => (
                        <div 
                          key={exp}
                          onClick={() => setValue("workoutExperience", exp)}
                          className={`p-4 rounded-xl border text-center cursor-pointer transition-all ${values.workoutExperience === exp ? 'border-primary bg-primary/10 text-primary' : 'border-white/10 bg-black/30 text-muted-foreground hover:border-white/30'}`}
                        >
                          <span className="font-medium">{exp}</span>
                        </div>
                      ))}
                    </div>
                    {form.formState.errors.workoutExperience && <p className="text-red-500 text-sm">{form.formState.errors.workoutExperience.message}</p>}
                  </div>

                  <div className="space-y-4 pt-4 border-t border-white/10">
                    <Label>Food Preference</Label>
                    <div className="grid grid-cols-2 gap-3">
                      {["Any", "Vegetarian", "Vegan", "Keto", "High Protein"].map((food) => (
                        <div 
                          key={food}
                          onClick={() => setValue("foodPreference", food)}
                          className={`p-3 rounded-xl border text-center cursor-pointer transition-all ${values.foodPreference === food ? 'border-primary bg-primary/10 text-primary' : 'border-white/10 bg-black/30 text-muted-foreground hover:border-white/30'}`}
                        >
                          <span className="font-medium text-sm">{food}</span>
                        </div>
                      ))}
                    </div>
                    {form.formState.errors.foodPreference && <p className="text-red-500 text-sm">{form.formState.errors.foodPreference.message}</p>}
                  </div>
                </div>
              )}

              {step === 5 && (
                <div className="space-y-8">
                  <h2 className="text-xl font-semibold text-white mb-4">Workout Setup</h2>
                  
                  <div className="flex items-center justify-between p-4 rounded-xl border border-white/10 bg-black/30">
                    <div>
                      <Label className="text-base text-white flex items-center gap-2">
                        {values.gymAvailability ? <Dumbbell className="w-4 h-4 text-primary" /> : <Home className="w-4 h-4 text-primary" />}
                        Gym Access
                      </Label>
                      <p className="text-sm text-muted-foreground">Will you be working out at a gym?</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">Home</span>
                      <Switch 
                        checked={values.gymAvailability} 
                        onCheckedChange={(c) => setValue("gymAvailability", c)} 
                      />
                      <span className="text-sm">Gym</span>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <Label className="text-base text-white">Days per week</Label>
                        <span className="text-xl font-display font-bold text-primary">{values.workoutDaysPerWeek} Days</span>
                      </div>
                      <Slider 
                        defaultValue={[values.workoutDaysPerWeek]} 
                        min={2} max={7} step={1}
                        onValueChange={(v) => setValue("workoutDaysPerWeek", v[0])}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label className="text-base text-white">Preferred Workout Time</Label>
                    <div className="flex flex-wrap gap-3">
                      {["Morning", "Afternoon", "Evening", "Flexible"].map((time) => (
                        <div 
                          key={time}
                          onClick={() => setValue("preferredWorkoutTime", time)}
                          className={`px-5 py-2.5 rounded-full border cursor-pointer transition-all ${values.preferredWorkoutTime === time ? 'border-primary bg-primary/10 text-primary font-bold' : 'border-white/10 bg-black/30 text-muted-foreground hover:border-white/30 font-medium'}`}
                        >
                          {time}
                        </div>
                      ))}
                    </div>
                    {form.formState.errors.preferredWorkoutTime && <p className="text-red-500 text-sm">{form.formState.errors.preferredWorkoutTime.message}</p>}
                  </div>
                </div>
              )}

              {step === 6 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-white mb-2">Health Info</h2>
                    <p className="text-sm text-muted-foreground">Optional, helps AI personalize your plan safely.</p>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="medicalConditions">Medical Conditions</Label>
                      <Textarea id="medicalConditions" {...form.register("medicalConditions")} className="bg-black/50 border-white/10 min-h-[80px]" placeholder="e.g. Asthma, High blood pressure..." />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="injuries">Past or Current Injuries</Label>
                      <Textarea id="injuries" {...form.register("injuries")} className="bg-black/50 border-white/10 min-h-[80px]" placeholder="e.g. Lower back pain, knee surgery..." />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="allergies">Food Allergies</Label>
                      <Textarea id="allergies" {...form.register("allergies")} className="bg-black/50 border-white/10 min-h-[80px]" placeholder="e.g. Peanuts, Gluten..." />
                    </div>
                  </div>
                </div>
              )}

              {step === 7 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-display font-bold text-center text-primary mb-6 text-glow">Review Profile</h2>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-1">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">Metrics</p>
                      <p className="text-white font-medium">{values.heightCm}cm / {values.weightKg}kg</p>
                    </div>
                    <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-1">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">Goal</p>
                      <p className="text-white font-medium">{values.goal}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-1">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">Experience</p>
                      <p className="text-white font-medium">{values.workoutExperience}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-1">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">Schedule</p>
                      <p className="text-white font-medium">{values.workoutDaysPerWeek} days / {values.preferredWorkoutTime}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-1 col-span-2">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">Diet</p>
                      <p className="text-white font-medium">{values.foodPreference}</p>
                    </div>
                  </div>

                  <div className="pt-6">
                    <Button 
                      type="submit" 
                      className="w-full h-14 rounded-full bg-primary hover:bg-primary/90 text-black font-bold text-lg shadow-[0_0_20px_rgba(255,215,0,0.3)]"
                      disabled={updateProfile.isPending}
                    >
                      {updateProfile.isPending ? "Saving..." : "Complete Setup"}
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation Controls */}
          {step < TOTAL_STEPS && (
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/10">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleBack} 
                disabled={step === 1}
                className="px-6 rounded-full border-white/20 hover:bg-white/10 text-white"
              >
                Back
              </Button>
              <Button 
                type="button" 
                onClick={handleNext}
                className="px-8 rounded-full bg-primary hover:bg-primary/90 text-black font-bold"
              >
                Next Step
              </Button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}