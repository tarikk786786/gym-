import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useGetProfile, useUpdateProfile, getGetProfileQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Navbar } from "@/components/landing/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { User, Activity, Flame, HeartPulse, Save } from "lucide-react";

const profileSchema = z.object({
  fullName: z.string().min(1, "Name is required"),
  age: z.coerce.number().min(13).max(100),
  gender: z.string().min(1),
  heightCm: z.coerce.number().min(50).max(300),
  weightKg: z.coerce.number().min(20).max(300),
  chestCm: z.coerce.number().optional(),
  waistCm: z.coerce.number().optional(),
  hipsCm: z.coerce.number().optional(),
  armsCm: z.coerce.number().optional(),
  thighsCm: z.coerce.number().optional(),
  shouldersCm: z.coerce.number().optional(),
  goal: z.string().min(1),
  activityLevel: z.string().min(1),
  workoutExperience: z.string().min(1),
  workoutDaysPerWeek: z.number().min(1).max(7),
  preferredWorkoutTime: z.string().min(1),
  gymAvailability: z.boolean(),
  foodPreference: z.string().min(1),
  dailyCalories: z.coerce.number().optional(),
  waterIntakeLiters: z.coerce.number().optional(),
  medicalConditions: z.string().optional(),
  injuries: z.string().optional(),
  allergies: z.string().optional(),
  sleepHours: z.coerce.number().optional(),
  stressLevel: z.number().min(1).max(10).optional(),
});

type ProfileData = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const { data: profile, isLoading } = useGetProfile();
  const updateProfile = useUpdateProfile();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const form = useForm<ProfileData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: "",
      age: 25,
      gender: "",
      heightCm: 170,
      weightKg: 70,
      goal: "",
      activityLevel: "",
      workoutExperience: "",
      workoutDaysPerWeek: 4,
      preferredWorkoutTime: "",
      gymAvailability: true,
      foodPreference: "",
      stressLevel: 5,
    }
  });

  useEffect(() => {
    if (profile) {
      form.reset({
        fullName: profile.fullName || "",
        age: profile.age || 25,
        gender: profile.gender || "",
        heightCm: profile.heightCm || 170,
        weightKg: profile.weightKg || 70,
        chestCm: profile.chestCm || undefined,
        waistCm: profile.waistCm || undefined,
        hipsCm: profile.hipsCm || undefined,
        armsCm: profile.armsCm || undefined,
        thighsCm: profile.thighsCm || undefined,
        shouldersCm: profile.shouldersCm || undefined,
        goal: profile.goal || "",
        activityLevel: profile.activityLevel || "",
        workoutExperience: profile.workoutExperience || "",
        workoutDaysPerWeek: profile.workoutDaysPerWeek || 4,
        preferredWorkoutTime: profile.preferredWorkoutTime || "",
        gymAvailability: profile.gymAvailability ?? true,
        foodPreference: profile.foodPreference || "",
        dailyCalories: profile.dailyCalories || undefined,
        waterIntakeLiters: profile.waterIntakeLiters || undefined,
        medicalConditions: profile.medicalConditions || "",
        injuries: profile.injuries || "",
        allergies: profile.allergies || "",
        sleepHours: profile.sleepHours || undefined,
        stressLevel: profile.stressLevel || 5,
      });
    }
  }, [profile, form]);

  const onSubmit = async (data: ProfileData) => {
    try {
      await updateProfile.mutateAsync({ data });
      queryClient.setQueryData(getGetProfileQueryKey(), (old: any) => ({ ...old, ...data }));
      toast({
        title: "Profile Updated",
        description: "Your profile has been saved successfully.",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[100dvh] flex flex-col bg-background">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-20 px-4 md:px-6">
        <div className="container mx-auto max-w-4xl">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-display font-bold text-white">Profile Settings</h1>
              <p className="text-muted-foreground mt-2">Manage your metrics and preferences for better AI plans.</p>
            </div>
            <Button 
              onClick={form.handleSubmit(onSubmit)} 
              disabled={updateProfile.isPending}
              className="rounded-full bg-primary text-black font-bold hover:bg-primary/90 px-6"
            >
              <Save className="w-4 h-4 mr-2" />
              {updateProfile.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            
            {/* Personal Section */}
            <div className="glass-panel p-6 md:p-8 rounded-3xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-primary/10 rounded-xl text-primary">
                  <User className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-semibold text-white">Personal</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input {...form.register("fullName")} className="bg-black/40 border-white/10" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Age</Label>
                    <Input type="number" {...form.register("age")} className="bg-black/40 border-white/10" />
                  </div>
                  <div className="space-y-2">
                    <Label>Gender</Label>
                    <Select onValueChange={(v) => form.setValue("gender", v)} value={form.watch("gender")}>
                      <SelectTrigger className="bg-black/40 border-white/10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Non-binary">Non-binary</SelectItem>
                        <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>

            {/* Body Metrics Section */}
            <div className="glass-panel p-6 md:p-8 rounded-3xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-primary/10 rounded-xl text-primary">
                  <Activity className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-semibold text-white">Body Metrics</h2>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                <div className="space-y-2">
                  <Label>Height (cm)</Label>
                  <Input type="number" {...form.register("heightCm")} className="bg-black/40 border-white/10" />
                </div>
                <div className="space-y-2">
                  <Label>Weight (kg)</Label>
                  <Input type="number" {...form.register("weightKg")} className="bg-black/40 border-white/10" />
                </div>
                <div className="space-y-2">
                  <Label>Chest (cm)</Label>
                  <Input type="number" {...form.register("chestCm")} className="bg-black/40 border-white/10" />
                </div>
                <div className="space-y-2">
                  <Label>Waist (cm)</Label>
                  <Input type="number" {...form.register("waistCm")} className="bg-black/40 border-white/10" />
                </div>
                <div className="space-y-2">
                  <Label>Hips (cm)</Label>
                  <Input type="number" {...form.register("hipsCm")} className="bg-black/40 border-white/10" />
                </div>
                <div className="space-y-2">
                  <Label>Arms (cm)</Label>
                  <Input type="number" {...form.register("armsCm")} className="bg-black/40 border-white/10" />
                </div>
                <div className="space-y-2">
                  <Label>Thighs (cm)</Label>
                  <Input type="number" {...form.register("thighsCm")} className="bg-black/40 border-white/10" />
                </div>
                <div className="space-y-2">
                  <Label>Shoulders (cm)</Label>
                  <Input type="number" {...form.register("shouldersCm")} className="bg-black/40 border-white/10" />
                </div>
              </div>
            </div>

            {/* Fitness Goals */}
            <div className="glass-panel p-6 md:p-8 rounded-3xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-primary/10 rounded-xl text-primary">
                  <Flame className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-semibold text-white">Fitness Goals & Setup</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Primary Goal</Label>
                  <Select onValueChange={(v) => form.setValue("goal", v)} value={form.watch("goal")}>
                    <SelectTrigger className="bg-black/40 border-white/10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Weight Loss">Weight Loss</SelectItem>
                      <SelectItem value="Muscle Gain">Muscle Gain</SelectItem>
                      <SelectItem value="Maintain">Maintain</SelectItem>
                      <SelectItem value="Body Recomposition">Body Recomposition</SelectItem>
                      <SelectItem value="Strength">Strength</SelectItem>
                      <SelectItem value="Endurance">Endurance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Activity Level</Label>
                  <Select onValueChange={(v) => form.setValue("activityLevel", v)} value={form.watch("activityLevel")}>
                    <SelectTrigger className="bg-black/40 border-white/10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Sedentary">Sedentary</SelectItem>
                      <SelectItem value="Lightly Active">Lightly Active</SelectItem>
                      <SelectItem value="Moderately Active">Moderately Active</SelectItem>
                      <SelectItem value="Very Active">Very Active</SelectItem>
                      <SelectItem value="Athlete">Athlete</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Workout Experience</Label>
                  <Select onValueChange={(v) => form.setValue("workoutExperience", v)} value={form.watch("workoutExperience")}>
                    <SelectTrigger className="bg-black/40 border-white/10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Beginner">Beginner</SelectItem>
                      <SelectItem value="Intermediate">Intermediate</SelectItem>
                      <SelectItem value="Advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Preferred Workout Time</Label>
                  <Select onValueChange={(v) => form.setValue("preferredWorkoutTime", v)} value={form.watch("preferredWorkoutTime")}>
                    <SelectTrigger className="bg-black/40 border-white/10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Morning">Morning</SelectItem>
                      <SelectItem value="Afternoon">Afternoon</SelectItem>
                      <SelectItem value="Evening">Evening</SelectItem>
                      <SelectItem value="Flexible">Flexible</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  <Label>Workout Days per Week ({form.watch("workoutDaysPerWeek")})</Label>
                  <Slider 
                    value={[form.watch("workoutDaysPerWeek")]} 
                    min={1} max={7} step={1}
                    onValueChange={(v) => form.setValue("workoutDaysPerWeek", v[0])}
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl border border-white/10 bg-black/20 mt-2">
                  <div>
                    <Label className="text-white">Gym Access</Label>
                    <p className="text-sm text-muted-foreground">Will you workout at a gym?</p>
                  </div>
                  <Switch 
                    checked={form.watch("gymAvailability")} 
                    onCheckedChange={(c) => form.setValue("gymAvailability", c)} 
                  />
                </div>
              </div>
            </div>

            {/* Health & Nutrition */}
            <div className="glass-panel p-6 md:p-8 rounded-3xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-primary/10 rounded-xl text-primary">
                  <HeartPulse className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-semibold text-white">Health & Nutrition</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-2">
                  <Label>Food Preference</Label>
                  <Select onValueChange={(v) => form.setValue("foodPreference", v)} value={form.watch("foodPreference")}>
                    <SelectTrigger className="bg-black/40 border-white/10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Any">Any</SelectItem>
                      <SelectItem value="Vegetarian">Vegetarian</SelectItem>
                      <SelectItem value="Vegan">Vegan</SelectItem>
                      <SelectItem value="Keto">Keto</SelectItem>
                      <SelectItem value="High Protein">High Protein</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Daily Calories</Label>
                    <Input type="number" {...form.register("dailyCalories")} className="bg-black/40 border-white/10" placeholder="e.g. 2500" />
                  </div>
                  <div className="space-y-2">
                    <Label>Water (Liters)</Label>
                    <Input type="number" step="0.1" {...form.register("waterIntakeLiters")} className="bg-black/40 border-white/10" placeholder="e.g. 3.5" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Medical Conditions</Label>
                  <Textarea {...form.register("medicalConditions")} className="bg-black/40 border-white/10 resize-none h-24" />
                </div>
                <div className="space-y-2">
                  <Label>Injuries</Label>
                  <Textarea {...form.register("injuries")} className="bg-black/40 border-white/10 resize-none h-24" />
                </div>
                <div className="space-y-2">
                  <Label>Allergies</Label>
                  <Textarea {...form.register("allergies")} className="bg-black/40 border-white/10 resize-none h-24" />
                </div>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label>Sleep Hours/Night</Label>
                    <Input type="number" step="0.5" {...form.register("sleepHours")} className="bg-black/40 border-white/10" />
                  </div>
                  <div className="space-y-4">
                    <Label>Stress Level (1-10): {form.watch("stressLevel")}</Label>
                    <Slider 
                      value={[form.watch("stressLevel") || 5]} 
                      min={1} max={10} step={1}
                      onValueChange={(v) => form.setValue("stressLevel", v[0])}
                    />
                  </div>
                </div>
              </div>
            </div>
            
          </form>
        </div>
      </main>
    </div>
  );
}