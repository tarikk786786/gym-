import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Navbar } from "@/components/landing/Navbar";
import { Dumbbell, Save, RefreshCw, Info, AlertTriangle, Zap, Check, Droplets, Flame, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useGenerateWorkoutPlan } from "@workspace/api-client-react";
import type { SavedWorkoutPlan } from "@workspace/api-client-react";

export default function WorkoutPage() {
  const [, setLocation] = useLocation();
  const [formData, setFormData] = useState({
    goal: "Muscle Gain",
    experience: "Intermediate",
    split: "Push Pull Legs",
    daysPerWeek: 4,
    location: "Gym",
    additionalNotes: ""
  });
  
  const generateMutation = useGenerateWorkoutPlan();
  const [plan, setPlan] = useState<SavedWorkoutPlan | null>(null);

  const handleGenerate = () => {
    generateMutation.mutate(
      { data: formData },
      {
        onSuccess: (result) => {
          setPlan(result);
        }
      }
    );
  };

  const handleReset = () => {
    setPlan(null);
  };

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-20 md:pt-24 pb-28 md:pb-16 px-4 md:px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="flex flex-col lg:flex-row gap-8">
            
            {/* Form Panel */}
            <div className={`w-full ${plan ? 'lg:w-[40%]' : 'max-w-2xl mx-auto'} transition-all duration-500`}>
              <div className="glass-panel p-5 sm:p-8 rounded-[1.5rem] lg:sticky lg:top-24">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <Zap className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-display font-bold text-white">AI Workout Generator</h1>
                    <p className="text-muted-foreground text-sm">Configure your optimal training split</p>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Goal */}
                  <div>
                    <label className="text-xs uppercase tracking-wider text-muted-foreground font-bold mb-3 block">Primary Goal</label>
                    <div className="grid grid-cols-2 gap-2 sm:gap-3">
                      {["Weight Loss", "Muscle Gain", "Strength", "Endurance", "Athletic", "Recomposition"].map(goal => (
                        <button
                          key={goal}
                          onClick={() => setFormData({...formData, goal})}
                          className={`p-3 rounded-xl border text-sm font-medium transition-all text-left
                            ${formData.goal === goal ? 'bg-primary/10 border-primary text-white' : 'bg-black/40 border-white/5 text-gray-400 hover:border-white/20'}`}
                        >
                          {goal}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Experience */}
                  <div>
                    <label className="text-xs uppercase tracking-wider text-muted-foreground font-bold mb-3 block">Experience Level</label>
                    <div className="grid grid-cols-3 gap-2">
                      {["Beginner", "Intermediate", "Advanced"].map(exp => (
                        <button
                          key={exp}
                          onClick={() => setFormData({...formData, experience: exp})}
                          className={`p-3 rounded-xl border text-sm font-medium transition-all text-center
                            ${formData.experience === exp ? 'bg-primary/10 border-primary text-white' : 'bg-black/40 border-white/5 text-gray-400 hover:border-white/20'}`}
                        >
                          {exp}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Split */}
                  <div>
                    <label className="text-xs uppercase tracking-wider text-muted-foreground font-bold mb-3 block">Training Split</label>
                    <div className="flex flex-wrap gap-2">
                      {["Push Pull Legs", "Upper Lower", "Arnold Split", "Full Body", "Bro Split"].map(split => (
                        <button
                          key={split}
                          onClick={() => setFormData({...formData, split})}
                          className={`px-4 py-2 rounded-xl border text-sm font-medium transition-all
                            ${formData.split === split ? 'bg-primary/10 border-primary text-white' : 'bg-black/40 border-white/5 text-gray-400 hover:border-white/20'}`}
                        >
                          {split}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Days & Location */}
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="text-xs uppercase tracking-wider text-muted-foreground font-bold mb-3 block">Days / Week</label>
                      <div className="flex bg-black/40 border border-white/10 rounded-xl p-1">
                        {[3, 4, 5, 6].map(days => (
                          <button
                            key={days}
                            onClick={() => setFormData({...formData, daysPerWeek: days})}
                            className={`flex-1 py-2 text-center rounded-lg text-sm font-medium transition-all
                              ${formData.daysPerWeek === days ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}
                          >
                            {days}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-xs uppercase tracking-wider text-muted-foreground font-bold mb-3 block">Location</label>
                      <div className="flex bg-black/40 border border-white/10 rounded-xl p-1">
                        {["Gym", "Home"].map(loc => (
                          <button
                            key={loc}
                            onClick={() => setFormData({...formData, location: loc})}
                            className={`flex-1 py-2 text-center rounded-lg text-sm font-medium transition-all
                              ${formData.location === loc ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}
                          >
                            {loc}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="text-xs uppercase tracking-wider text-muted-foreground font-bold mb-3 block">Additional Context (Optional)</label>
                    <Textarea 
                      placeholder="Injuries, weak points, equipment limits..."
                      className="bg-black/40 border-white/10 resize-none h-20 text-white"
                      value={formData.additionalNotes}
                      onChange={e => setFormData({...formData, additionalNotes: e.target.value})}
                      maxLength={200}
                    />
                  </div>

                  <Button 
                    className="w-full h-14 text-lg font-bold bg-primary text-black hover:bg-yellow-500 rounded-xl"
                    onClick={handleGenerate}
                    disabled={generateMutation.isPending || !!plan}
                  >
                    {generateMutation.isPending ? "Generating Plan..." : "Generate My Workout Plan"}
                  </Button>
                </div>
              </div>
            </div>

            {/* Results / Loading Panel */}
            <div className={`w-full lg:w-[60%] transition-opacity duration-500 ${plan || generateMutation.isPending ? 'opacity-100' : 'opacity-0 hidden lg:block lg:invisible'}`}>
              
              {generateMutation.isPending && (
                <div className="glass-panel p-12 rounded-[1.5rem] flex flex-col items-center justify-center h-full min-h-[600px]">
                  <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center mb-8 relative">
                    <div className="absolute inset-0 border-4 border-primary rounded-full animate-ping opacity-20"></div>
                    <Dumbbell className="w-12 h-12 text-primary animate-pulse" />
                  </div>
                  <h3 className="text-2xl font-display font-bold text-white mb-2">Architecting your plan...</h3>
                  <div className="h-6 overflow-hidden relative w-64 text-center">
                    <div className="animate-[slide-up_10s_infinite] flex flex-col text-primary/80 font-medium">
                      <span>Analyzing your profile...</span>
                      <span>Designing your split...</span>
                      <span>Selecting optimal exercises...</span>
                      <span>Calculating sets and reps...</span>
                      <span>Building your program...</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-8">Estimated time: ~15 seconds</p>
                </div>
              )}

              {plan && (
                <div className="space-y-6 animate-in slide-in-from-bottom-8 duration-700">
                  <div className="glass-panel p-6 sm:p-8 rounded-[1.5rem]">
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                      <div className="flex items-center gap-3">
                        <span className="px-3 py-1 bg-primary/20 text-primary text-xs font-bold uppercase tracking-wider rounded-full border border-primary/30">
                          {plan.plan.duration}
                        </span>
                        <span className="px-3 py-1 bg-white/5 text-gray-300 text-xs font-bold uppercase tracking-wider rounded-full border border-white/10">
                          {plan.split}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-green-400 text-sm font-medium px-3 py-1 bg-green-400/10 rounded-full border border-green-400/20">
                        <Check className="w-4 h-4" /> Saved to My Plans
                      </div>
                    </div>
                    
                    <h2 className="text-3xl sm:text-4xl font-display font-bold text-white mb-4">
                      {plan.plan.programName}
                    </h2>
                    <p className="text-gray-300 leading-relaxed text-lg">
                      {plan.plan.overview}
                    </p>
                  </div>

                  <Tabs defaultValue={plan.plan.weeklySchedule[0]?.day} className="w-full">
                    <TabsList className="w-full bg-black/40 border border-white/10 p-1 rounded-xl flex overflow-x-auto h-auto min-h-12 mb-6">
                      {plan.plan.weeklySchedule.map(day => (
                        <TabsTrigger 
                          key={day.day} 
                          value={day.day}
                          className="flex-1 min-w-[80px] rounded-lg data-[state=active]:bg-primary data-[state=active]:text-black text-gray-400 py-2.5 font-medium"
                        >
                          {day.day}
                        </TabsTrigger>
                      ))}
                    </TabsList>

                    {plan.plan.weeklySchedule.map(day => (
                      <TabsContent key={day.day} value={day.day} className="space-y-4 outline-none">
                        <div className="glass-panel p-6 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-l-4 border-l-primary">
                          <div>
                            <h3 className="text-xl font-bold text-white">{day.sessionName}</h3>
                            <p className="text-sm text-primary mt-1">{day.targetMuscles}</p>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-400 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
                            <Timer className="w-4 h-4" />
                            {day.estimatedDurationMin} mins
                          </div>
                        </div>

                        {(day.warmup || day.cooldown) && (
                          <Accordion type="single" collapsible className="w-full space-y-2">
                            {day.warmup && (
                              <AccordionItem value="warmup" className="glass-panel border-white/10 rounded-xl px-4 overflow-hidden border-none">
                                <AccordionTrigger className="text-white hover:no-underline py-4">
                                  <div className="flex items-center gap-2"><Flame className="w-4 h-4 text-orange-400"/> Warmup Protocol</div>
                                </AccordionTrigger>
                                <AccordionContent className="text-gray-300 pb-4 leading-relaxed">
                                  {day.warmup}
                                </AccordionContent>
                              </AccordionItem>
                            )}
                            {day.cooldown && (
                              <AccordionItem value="cooldown" className="glass-panel border-white/10 rounded-xl px-4 overflow-hidden border-none">
                                <AccordionTrigger className="text-white hover:no-underline py-4">
                                  <div className="flex items-center gap-2"><Droplets className="w-4 h-4 text-blue-400"/> Cooldown</div>
                                </AccordionTrigger>
                                <AccordionContent className="text-gray-300 pb-4 leading-relaxed">
                                  {day.cooldown}
                                </AccordionContent>
                              </AccordionItem>
                            )}
                          </Accordion>
                        )}

                        <div className="space-y-4 mt-6">
                          {day.exercises.map((ex, i) => (
                            <div key={i} className="glass-panel p-5 sm:p-6 rounded-2xl">
                              <div className="flex flex-col sm:flex-row justify-between gap-4 mb-4">
                                <div>
                                  <h4 className="text-lg font-bold text-white flex items-center gap-2">
                                    <span className="text-primary/50 text-sm">{i+1}.</span> {ex.name}
                                  </h4>
                                  <div className="flex flex-wrap gap-2 mt-2">
                                    {ex.primaryMuscles.map(m => <span key={m} className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded border border-primary/20">{m}</span>)}
                                    {ex.secondaryMuscles.map(m => <span key={m} className="text-xs bg-white/10 text-gray-300 px-2 py-0.5 rounded border border-white/10">{m}</span>)}
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  <div className="text-right">
                                    <div className="text-xl font-display font-bold text-white">{ex.sets} × {ex.reps}</div>
                                    <div className="text-xs text-gray-500">Sets × Reps</div>
                                  </div>
                                </div>
                              </div>

                              <div className="grid grid-cols-3 gap-2 mb-4 bg-black/40 rounded-xl p-3 border border-white/5">
                                <div className="text-center">
                                  <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Rest</div>
                                  <div className="text-sm font-medium text-white">{ex.rest}</div>
                                </div>
                                <div className="text-center border-l border-r border-white/10">
                                  <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Tempo</div>
                                  <div className="text-sm font-medium text-white">{ex.tempo}</div>
                                </div>
                                <div className="text-center">
                                  <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">RPE</div>
                                  <div className={`text-sm font-bold inline-block px-2 py-0.5 rounded
                                    ${ex.rpe >= 9 ? 'bg-red-500/20 text-red-400' : ex.rpe >= 7 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-green-500/20 text-green-400'}`}>
                                    {ex.rpe}/10
                                  </div>
                                </div>
                              </div>

                              <Accordion type="multiple" className="w-full">
                                <AccordionItem value="tips" className="border-b-0 border-t border-white/10">
                                  <AccordionTrigger className="py-2 text-sm text-gray-400 hover:no-underline hover:text-white">
                                    <div className="flex items-center gap-2"><Info className="w-4 h-4"/> Execution Tips</div>
                                  </AccordionTrigger>
                                  <AccordionContent className="text-gray-300 text-sm">
                                    {ex.tips}
                                  </AccordionContent>
                                </AccordionItem>
                                <AccordionItem value="mistakes" className="border-b-0 border-t border-white/10">
                                  <AccordionTrigger className="py-2 text-sm text-gray-400 hover:no-underline hover:text-white">
                                    <div className="flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-orange-400"/> Common Mistakes</div>
                                  </AccordionTrigger>
                                  <AccordionContent className="text-gray-300 text-sm">
                                    {ex.commonMistakes}
                                  </AccordionContent>
                                </AccordionItem>
                              </Accordion>
                            </div>
                          ))}
                        </div>
                      </TabsContent>
                    ))}
                  </Tabs>

                  <div className="glass-panel p-6 rounded-2xl border-l-4 border-l-primary/50 bg-primary/5">
                    <h3 className="font-bold text-white mb-2">Progression Protocol</h3>
                    <p className="text-sm text-gray-300 leading-relaxed">
                      {plan.plan.progressionNotes}
                    </p>
                  </div>

                  <div className="flex justify-between items-center pt-6 pb-12">
                    <Link href="/plans">
                      <Button variant="outline" className="border-white/10 text-white hover:bg-white/5">
                        <Save className="w-4 h-4 mr-2" /> View All Plans
                      </Button>
                    </Link>
                    <Button onClick={handleReset} className="bg-primary text-black hover:bg-yellow-500 font-bold">
                      <RefreshCw className="w-4 h-4 mr-2" /> Generate New
                    </Button>
                  </div>
                </div>
              )}
            </div>
            
          </div>
        </div>
      </main>
    </div>
  );
}
