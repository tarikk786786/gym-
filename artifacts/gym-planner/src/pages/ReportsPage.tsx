import { Navbar } from "@/components/landing/Navbar";
import { Download, Share2, FileText, CheckCircle2, FileCheck2, User, Activity, Ruler, Target, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useGetProfile } from "@workspace/api-client-react";

export default function ReportsPage() {
  const [copied, setCopied] = useState(false);
  const { data: profile } = useGetProfile();

  const handleDownload = () => {
    const basePath = import.meta.env.BASE_URL?.replace(/\/$/, "") || "";
    window.open(`${basePath}/api/reports/generate`, "_blank");
  };

  const handleShare = () => {
    const basePath = import.meta.env.BASE_URL?.replace(/\/$/, "") || "";
    const reportUrl = `${window.location.origin}${basePath}/api/reports/generate`;
    navigator.clipboard.writeText(reportUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const currentDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 pt-24 pb-16 px-4 md:px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-10 text-center md:text-left">
            <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-3">
              Fitness <span className="text-primary text-glow">Report</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl">
              Your complete AI-powered fitness snapshot. Download a comprehensive PDF detailing your metrics, progress, and personalized plans.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            
            {/* Left Column: Preview */}
            <div className="lg:col-span-7 space-y-6">
              <div className="glass-panel p-1 rounded-[2rem] overflow-hidden border-2 border-primary/20 bg-gradient-to-br from-white/5 to-transparent relative group">
                <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                {/* PDF Cover Mockup */}
                <div className="bg-[#0a0a0a] rounded-[1.8rem] p-8 sm:p-12 border border-white/5 h-full relative overflow-hidden">
                  {/* Decorative corner */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-bl-full -mr-16 -mt-16"></div>
                  
                  <div className="flex items-center gap-3 mb-12">
                    <FileCheck2 className="w-8 h-8 text-primary" />
                    <span className="text-xl font-display font-bold text-white tracking-widest uppercase">AI GYM PLANNER</span>
                  </div>

                  <div className="space-y-4 mb-16">
                    <h2 className="text-4xl sm:text-5xl font-display font-bold text-white leading-tight">
                      Comprehensive Fitness <span className="text-primary">Analysis</span>
                    </h2>
                    <p className="text-xl text-gray-400">Prepared for <strong className="text-white">{profile?.fullName || "Athlete"}</strong></p>
                    <p className="text-sm text-gray-500">{currentDate}</p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-16">
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                      <div className="text-xs text-muted-foreground uppercase mb-1">Goal</div>
                      <div className="text-sm font-bold text-white truncate">{profile?.goal || "Not set"}</div>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                      <div className="text-xs text-muted-foreground uppercase mb-1">Experience</div>
                      <div className="text-sm font-bold text-white truncate">{profile?.workoutExperience || "Not set"}</div>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                      <div className="text-xs text-muted-foreground uppercase mb-1">BMI</div>
                      <div className="text-sm font-bold text-white">
                        {profile?.heightCm && profile?.weightKg 
                          ? (profile.weightKg / Math.pow(profile.heightCm/100, 2)).toFixed(1) 
                          : "--"}
                      </div>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                      <div className="text-xs text-muted-foreground uppercase mb-1">TDEE</div>
                      <div className="text-sm font-bold text-primary">{profile?.dailyCalories || "--"} kcal</div>
                    </div>
                  </div>

                  <div className="space-y-4 relative z-10">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-6">Report Contents</h3>
                    {[
                      { icon: User, text: "Personal Details & Health Profile" },
                      { icon: Activity, text: "Fitness Analysis (BMI, TDEE, Macros)" },
                      { icon: Ruler, text: "Body Measurements & Composition" },
                      { icon: Target, text: "Recent Progress (30 days history)" },
                      { icon: FileText, text: "Active AI Workout Plan" },
                      { icon: FileText, text: "Active AI Diet Plan & Nutrition Tips" }
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-4 text-gray-300">
                        <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                        <span className="flex-1 font-medium">{item.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Actions */}
            <div className="lg:col-span-5 space-y-6">
              <div className="glass-panel p-8 rounded-[2rem] sticky top-28">
                <h3 className="text-2xl font-display font-bold text-white mb-4">Export Options</h3>
                <p className="text-gray-400 mb-8 leading-relaxed">
                  This report includes your complete fitness profile, AI-generated workout and diet plans, 30-day progress history, and personalized recommendations.
                </p>

                <div className="space-y-4 mb-8">
                  <Button 
                    onClick={handleDownload}
                    className="w-full h-16 text-lg font-bold bg-primary text-black hover:bg-yellow-500 rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all"
                  >
                    <Download className="w-6 h-6 mr-3" /> Download PDF Report
                  </Button>
                  
                  <Button 
                    onClick={handleShare}
                    variant="outline"
                    className="w-full h-14 text-base font-bold border-primary/40 text-primary hover:bg-primary/10 rounded-2xl"
                  >
                    {copied ? (
                      <><Copy className="w-5 h-5 mr-2" /> Link Copied!</>
                    ) : (
                      <><Share2 className="w-5 h-5 mr-2" /> Share via Link</>
                    )}
                  </Button>
                </div>

                <div className="space-y-4 pt-6 border-t border-white/10 text-sm">
                  <div className="flex justify-between text-gray-400">
                    <span>Format</span>
                    <span className="text-white font-medium">PDF Document</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>Last Generated</span>
                    <span className="text-white font-medium">{currentDate}</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>Pages</span>
                    <span className="text-white font-medium">~4 Pages</span>
                  </div>
                </div>

                <div className="mt-8 p-4 bg-primary/5 rounded-xl border border-primary/10 text-center">
                  <p className="text-xs text-primary/80">
                    Generated securely by Tarik Islam AI Gym Planner.<br />For personal use only.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
