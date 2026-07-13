import { Link } from "wouter";
import { useGetProfile } from "@workspace/api-client-react";
import { useUser } from "@clerk/react";
import { Navbar } from "@/components/landing/Navbar";
import { Dumbbell, Utensils, Target, MessageSquare, Calculator, ClipboardList, ArrowRight, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const { user } = useUser();
  const { data: profile } = useGetProfile();

  const calculateBMI = (heightCm: number, weightKg: number) => {
    const heightM = heightCm / 100;
    return (weightKg / (heightM * heightM)).toFixed(1);
  };

  const isProfileComplete = profile && profile.heightCm && profile.weightKg && profile.goal;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-16 px-4 md:px-6">
        <div className="container mx-auto max-w-6xl">
          {/* Welcome Banner */}
          <div className="mb-10">
            <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-2">
              Welcome back, <span className="text-primary text-glow">{profile?.fullName || user?.firstName || 'Athlete'}</span>!
            </h1>
            <p className="text-muted-foreground text-lg">Your AI fitness journey continues.</p>
          </div>

          {/* Stats Bar */}
          {profile && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
              <div className="glass-panel p-4 rounded-2xl flex flex-col gap-1">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">BMI</span>
                <span className="text-2xl font-display font-bold text-white">
                  {profile.heightCm && profile.weightKg ? calculateBMI(profile.heightCm, profile.weightKg) : '--'}
                </span>
              </div>
              <div className="glass-panel p-4 rounded-2xl flex flex-col gap-1">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Goal</span>
                <span className="text-lg font-display font-bold text-white truncate">
                  {profile.goal || 'Not set'}
                </span>
              </div>
              <div className="glass-panel p-4 rounded-2xl flex flex-col gap-1">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Daily Target</span>
                <span className="text-2xl font-display font-bold text-white">
                  {profile.dailyCalories ? `${profile.dailyCalories} kcal` : 'Set in profile'}
                </span>
              </div>
              <div className="glass-panel p-4 rounded-2xl flex flex-col gap-1">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Workout Days</span>
                <span className="text-2xl font-display font-bold text-white">
                  {profile.workoutDaysPerWeek || 0}
                </span>
              </div>
            </div>
          )}

          {!isProfileComplete && (
            <div className="mb-10 p-6 rounded-2xl border border-primary/30 bg-primary/5 flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="text-primary w-6 h-6" />
                <div>
                  <h3 className="font-semibold text-white">Complete your profile</h3>
                  <p className="text-sm text-muted-foreground">Add your body metrics to unlock AI generation.</p>
                </div>
              </div>
              <Link href="/profile">
                <Button className="rounded-full bg-primary text-black font-bold hover:bg-primary/90">
                  Update Profile
                </Button>
              </Link>
            </div>
          )}

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FeatureCard 
              title="AI Workout Generator"
              description="Generate your personalized weekly plan"
              icon={Dumbbell}
              href="/workout"
              status="Launch"
            />
            <FeatureCard 
              title="AI Diet Planner"
              description="Get your custom meal blueprint"
              icon={Utensils}
              href="/diet"
              status="Launch"
            />
            <FeatureCard 
              title="Fitness Calculators"
              description="BMI, TDEE, macros, 1RM and more"
              icon={Calculator}
              href="/calculators"
              status="Launch"
            />
            <FeatureCard 
              title="My Plans"
              description="View and manage saved plans"
              icon={ClipboardList}
              href="/plans"
              status="Launch"
            />
            <FeatureCard 
              title="Progress Tracker"
              description="Track your transformation"
              icon={Target}
              href="/progress"
              status="Coming Soon"
            />
            <FeatureCard 
              title="AI Coach"
              description="Chat with your personal AI coach"
              icon={MessageSquare}
              href="/coach"
              status="Coming Soon"
            />
          </div>
        </div>
      </main>
    </div>
  );
}

function FeatureCard({ title, description, icon: Icon, href, status }: { title: string, description: string, icon: any, href: string, status?: string }) {
  return (
    <Link href={href}>
      <div className="group relative overflow-hidden glass-panel p-8 rounded-3xl cursor-pointer transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/10 hover:border-primary/30 h-full flex flex-col justify-between">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -mr-16 -mt-16 transition-transform group-hover:scale-150"></div>
        
        <div>
          <div className="w-14 h-14 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-center mb-6 group-hover:border-primary/40 group-hover:text-primary transition-colors">
            <Icon className="w-7 h-7 text-white group-hover:text-primary" />
          </div>
          <h3 className="text-2xl font-display font-bold text-white mb-2">{title}</h3>
          <p className="text-muted-foreground">{description}</p>
        </div>

        <div className="mt-8 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-primary bg-primary/10 px-3 py-1 rounded-full">
            {status || "Launch"}
          </span>
          <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-primary group-hover:text-black transition-colors">
            <ArrowRight className="w-5 h-5" />
          </div>
        </div>
      </div>
    </Link>
  );
}