import { Link } from "wouter";
import { useGetProfile } from "@workspace/api-client-react";
import { useUser } from "@clerk/react";
import { Navbar } from "@/components/landing/Navbar";
import { Dumbbell, Utensils, Target, MessageSquare, Calculator, ClipboardList, ArrowRight, AlertCircle, FileText, ShieldCheck } from "lucide-react";
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
      
      <main className="flex-1 pt-20 md:pt-24 pb-28 md:pb-16 px-4 md:px-6">
        <div className="container mx-auto max-w-6xl">
          {/* Welcome Banner */}
          <div className="mb-6 md:mb-10">
            <h1 className="text-2xl md:text-5xl font-display font-bold text-white mb-1 leading-tight">
              Welcome back,<br className="sm:hidden" /> <span className="text-primary text-glow">{profile?.fullName?.split(' ')[0] || user?.firstName || 'Athlete'}</span>!
            </h1>
            <p className="text-muted-foreground text-sm md:text-lg">Your AI fitness journey continues.</p>
          </div>

          {/* Stats Bar */}
          {profile && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6 md:mb-10">
              <div className="glass-panel p-3 md:p-4 rounded-2xl flex flex-col gap-0.5">
                <span className="text-[10px] md:text-xs font-medium text-muted-foreground uppercase tracking-wider">BMI</span>
                <span className="text-xl md:text-2xl font-display font-bold text-white">
                  {profile.heightCm && profile.weightKg ? calculateBMI(profile.heightCm, profile.weightKg) : '--'}
                </span>
              </div>
              <div className="glass-panel p-3 md:p-4 rounded-2xl flex flex-col gap-0.5">
                <span className="text-[10px] md:text-xs font-medium text-muted-foreground uppercase tracking-wider">Goal</span>
                <span className="text-base md:text-lg font-display font-bold text-white truncate">
                  {profile.goal || 'Not set'}
                </span>
              </div>
              <div className="glass-panel p-3 md:p-4 rounded-2xl flex flex-col gap-0.5">
                <span className="text-[10px] md:text-xs font-medium text-muted-foreground uppercase tracking-wider">Daily Target</span>
                <span className="text-base md:text-2xl font-display font-bold text-white leading-tight">
                  {profile.dailyCalories ? `${profile.dailyCalories} kcal` : '—'}
                </span>
              </div>
              <div className="glass-panel p-3 md:p-4 rounded-2xl flex flex-col gap-0.5">
                <span className="text-[10px] md:text-xs font-medium text-muted-foreground uppercase tracking-wider">Workout Days</span>
                <span className="text-xl md:text-2xl font-display font-bold text-white">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
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
              status="Launch"
            />
            <FeatureCard 
              title="AI Coach"
              description="Chat with your personal AI coach"
              icon={MessageSquare}
              href="/coach"
              status="Launch"
            />
            <FeatureCard 
              title="PDF Report"
              description="Download your fitness report"
              icon={FileText}
              href="/reports"
              status="Launch"
            />
            {profile?.isAdmin && (
              <FeatureCard 
                title="Admin Panel"
                description="Manage platform & users"
                icon={ShieldCheck}
                href="/admin"
                status="Admin Only"
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function FeatureCard({ title, description, icon: Icon, href, status }: { title: string, description: string, icon: any, href: string, status?: string }) {
  return (
    <Link href={href}>
      <div className="group relative overflow-hidden glass-panel p-5 md:p-8 rounded-2xl md:rounded-3xl cursor-pointer transition-all active:scale-95 md:hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/10 hover:border-primary/30 h-full flex flex-col justify-between min-h-[120px] md:min-h-[160px]">
        <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full -mr-12 -mt-12 transition-transform group-hover:scale-150"></div>
        
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 md:w-14 md:h-14 flex-shrink-0 rounded-xl md:rounded-2xl bg-black/40 border border-white/10 flex items-center justify-center group-hover:border-primary/40 transition-colors">
            <Icon className="w-5 h-5 md:w-7 md:h-7 text-white group-hover:text-primary transition-colors" />
          </div>
          <div className="min-w-0">
            <h3 className="text-base md:text-2xl font-display font-bold text-white mb-1 leading-tight">{title}</h3>
            <p className="text-muted-foreground text-xs md:text-sm">{description}</p>
          </div>
        </div>

        <div className="mt-4 md:mt-8 flex items-center justify-between">
          <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-1 md:px-3 rounded-full">
            {status || "Launch"}
          </span>
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-primary group-hover:text-black transition-colors">
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </div>
    </Link>
  );
}