import { useState } from "react";
import { Link } from "wouter";
import { Navbar } from "@/components/landing/Navbar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Dumbbell, Utensils, Trash2, Calendar, MapPin, Eye, Info, Clock, AlertTriangle, Target, Flame, Droplets, Check } from "lucide-react";
import { useListPlans, useDeleteWorkoutPlan, useDeleteDietPlan, getListPlansQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import type { SavedWorkoutPlan, SavedDietPlan } from "@workspace/api-client-react";

export default function PlansPage() {
  const queryClient = useQueryClient();
  const { data: plansData, isLoading } = useListPlans({ 
    query: { queryKey: getListPlansQueryKey(), retry: false } 
  });
  
  const deleteWorkoutMutation = useDeleteWorkoutPlan();
  const deleteDietMutation = useDeleteDietPlan();

  const handleDeleteWorkout = async (id: string) => {
    if (confirm("Are you sure you want to delete this workout plan?")) {
      await deleteWorkoutMutation.mutateAsync({ id });
      queryClient.invalidateQueries({ queryKey: getListPlansQueryKey() });
    }
  };

  const handleDeleteDiet = async (id: string) => {
    if (confirm("Are you sure you want to delete this diet plan?")) {
      await deleteDietMutation.mutateAsync({ id });
      queryClient.invalidateQueries({ queryKey: getListPlansQueryKey() });
    }
  };

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-16 px-4 md:px-6">
        <div className="container mx-auto max-w-5xl">
          <div className="mb-10">
            <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-2">
              My Plans
            </h1>
            <p className="text-muted-foreground text-lg">Your generated fitness and nutrition protocols.</p>
          </div>

          <Tabs defaultValue="workout" className="w-full">
            <TabsList className="bg-transparent border-b border-white/10 w-full justify-start h-12 p-0 rounded-none mb-8">
              <TabsTrigger 
                value="workout" 
                className="data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full px-6 font-display text-lg tracking-wide text-gray-500"
              >
                Workout Plans
              </TabsTrigger>
              <TabsTrigger 
                value="diet" 
                className="data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full px-6 font-display text-lg tracking-wide text-gray-500"
              >
                Diet Plans
              </TabsTrigger>
            </TabsList>

            <TabsContent value="workout" className="space-y-4">
              {isLoading ? (
                <div className="py-20 flex justify-center">
                  <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                </div>
              ) : !plansData?.workoutPlans || plansData.workoutPlans.length === 0 ? (
                <div className="glass-panel p-12 rounded-[1.5rem] flex flex-col items-center justify-center text-center">
                  <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                    <Dumbbell className="w-10 h-10 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">No Workout Plans Yet</h3>
                  <p className="text-muted-foreground mb-8 max-w-md">Generate your first AI-powered workout protocol tailored to your specific goals and experience.</p>
                  <Link href="/workout">
                    <Button className="bg-primary text-black font-bold hover:bg-yellow-500 rounded-xl px-8 h-12">
                      Generate Workout
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {plansData.workoutPlans.map(plan => (
                    <div key={plan.id} className="glass-panel p-6 rounded-[1.5rem] flex flex-col">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex flex-wrap gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded bg-primary/20 text-primary border border-primary/20">
                            {plan.goal}
                          </span>
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded bg-white/10 text-gray-300 border border-white/10">
                            {plan.split}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(plan.createdAt), 'MMM d, yyyy')}
                        </span>
                      </div>
                      
                      <h3 className="text-xl font-display font-bold text-white mb-1 line-clamp-1">{plan.plan.programName}</h3>
                      <p className="text-sm text-gray-400 mb-6 line-clamp-2">{plan.plan.overview}</p>
                      
                      <div className="flex items-center gap-4 mb-8 text-sm text-gray-300">
                        <div className="flex items-center gap-1.5 bg-black/40 px-3 py-1.5 rounded-lg border border-white/5">
                          <Calendar className="w-4 h-4 text-primary" /> {plan.daysPerWeek} days/wk
                        </div>
                        <div className="flex items-center gap-1.5 bg-black/40 px-3 py-1.5 rounded-lg border border-white/5">
                          <MapPin className="w-4 h-4 text-primary" /> {plan.location}
                        </div>
                      </div>
                      
                      <div className="mt-auto flex gap-3">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button className="flex-1 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl border border-white/10">
                              <Eye className="w-4 h-4 mr-2" /> View Plan
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-[#0a0a0a] border-white/10 p-0 sm:rounded-[2rem]">
                            <div className="p-6 sm:p-8">
                              <WorkoutPlanView plan={plan} />
                            </div>
                          </DialogContent>
                        </Dialog>
                        <Button 
                          variant="destructive" 
                          size="icon"
                          className="rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/40 hover:text-red-300 border border-red-500/30"
                          onClick={() => handleDeleteWorkout(plan.id)}
                          disabled={deleteWorkoutMutation.isPending}
                        >
                          <Trash2 className="w-5 h-5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="diet" className="space-y-4">
              {isLoading ? (
                <div className="py-20 flex justify-center">
                  <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                </div>
              ) : !plansData?.dietPlans || plansData.dietPlans.length === 0 ? (
                <div className="glass-panel p-12 rounded-[1.5rem] flex flex-col items-center justify-center text-center">
                  <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                    <Utensils className="w-10 h-10 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">No Diet Plans Yet</h3>
                  <p className="text-muted-foreground mb-8 max-w-md">Generate your first meal plan to fuel your body and hit your target macros.</p>
                  <Link href="/diet">
                    <Button className="bg-primary text-black font-bold hover:bg-yellow-500 rounded-xl px-8 h-12">
                      Generate Diet Plan
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {plansData.dietPlans.map(plan => (
                    <div key={plan.id} className="glass-panel p-6 rounded-[1.5rem] flex flex-col">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex flex-wrap gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded bg-primary/20 text-primary border border-primary/20">
                            {plan.dietStyle}
                          </span>
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded bg-white/10 text-gray-300 border border-white/10">
                            {plan.cuisine}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(plan.createdAt), 'MMM d, yyyy')}
                        </span>
                      </div>
                      
                      <div className="flex items-baseline gap-2 mb-6">
                        <span className="text-4xl font-display font-bold text-white">{plan.plan.dailyCalorieTarget}</span>
                        <span className="text-muted-foreground uppercase tracking-widest text-xs font-bold">kcal/day</span>
                      </div>
                      
                      <div className="mb-8">
                        <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden flex mb-2 border border-white/5">
                          <div className="h-full bg-blue-500" style={{ width: `${(plan.plan.macros.proteinG * 4 / plan.plan.dailyCalorieTarget) * 100}%` }} />
                          <div className="h-full bg-yellow-500" style={{ width: `${(plan.plan.macros.carbsG * 4 / plan.plan.dailyCalorieTarget) * 100}%` }} />
                          <div className="h-full bg-red-500" style={{ width: `${(plan.plan.macros.fatG * 9 / plan.plan.dailyCalorieTarget) * 100}%` }} />
                        </div>
                        <div className="flex justify-between text-[10px] uppercase font-bold tracking-wider">
                          <span className="text-blue-400">{plan.plan.macros.proteinG}g Pro</span>
                          <span className="text-yellow-400">{plan.plan.macros.carbsG}g Crb</span>
                          <span className="text-red-400">{plan.plan.macros.fatG}g Fat</span>
                        </div>
                      </div>
                      
                      <div className="mt-auto flex gap-3">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button className="flex-1 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl border border-white/10">
                              <Eye className="w-4 h-4 mr-2" /> View Plan
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-[#0a0a0a] border-white/10 p-0 sm:rounded-[2rem]">
                            <div className="p-6 sm:p-8">
                              <DietPlanView plan={plan} />
                            </div>
                          </DialogContent>
                        </Dialog>
                        <Button 
                          variant="destructive" 
                          size="icon"
                          className="rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/40 hover:text-red-300 border border-red-500/30"
                          onClick={() => handleDeleteDiet(plan.id)}
                          disabled={deleteDietMutation.isPending}
                        >
                          <Trash2 className="w-5 h-5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}

// Reusable views for the Modals
function WorkoutPlanView({ plan }: { plan: SavedWorkoutPlan }) {
  return (
    <div className="space-y-6">
      <div>
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <span className="px-3 py-1 bg-primary/20 text-primary text-xs font-bold uppercase tracking-wider rounded-full border border-primary/30">
            {plan.plan.duration}
          </span>
          <span className="px-3 py-1 bg-white/5 text-gray-300 text-xs font-bold uppercase tracking-wider rounded-full border border-white/10">
            {plan.split}
          </span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-display font-bold text-white mb-4">
          {plan.plan.programName}
        </h2>
        <p className="text-gray-300 leading-relaxed text-lg mb-6">
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
            <div className="glass-panel p-6 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-l-4 border-l-primary bg-[#111]">
              <div>
                <h3 className="text-xl font-bold text-white">{day.sessionName}</h3>
                <p className="text-sm text-primary mt-1">{day.targetMuscles}</p>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
                <Clock className="w-4 h-4" />
                {day.estimatedDurationMin} mins
              </div>
            </div>

            {(day.warmup || day.cooldown) && (
              <Accordion type="single" collapsible className="w-full space-y-2">
                {day.warmup && (
                  <AccordionItem value="warmup" className="glass-panel border-white/10 rounded-xl px-4 overflow-hidden border-none bg-[#111]">
                    <AccordionTrigger className="text-white hover:no-underline py-4">
                      <div className="flex items-center gap-2"><Flame className="w-4 h-4 text-orange-400"/> Warmup Protocol</div>
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-300 pb-4 leading-relaxed">
                      {day.warmup}
                    </AccordionContent>
                  </AccordionItem>
                )}
                {day.cooldown && (
                  <AccordionItem value="cooldown" className="glass-panel border-white/10 rounded-xl px-4 overflow-hidden border-none bg-[#111]">
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
                <div key={i} className="glass-panel p-5 sm:p-6 rounded-2xl bg-[#111]">
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
    </div>
  );
}

function DietPlanView({ plan }: { plan: SavedDietPlan }) {
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const toggleCheck = (item: string) => setCheckedItems(prev => ({ ...prev, [item]: !prev[item] }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <span className="px-3 py-1 bg-white/5 text-gray-300 text-xs font-bold uppercase tracking-wider rounded-full border border-white/10">
          {plan.dietStyle}
        </span>
        <span className="px-3 py-1 bg-white/5 text-gray-300 text-xs font-bold uppercase tracking-wider rounded-full border border-white/10">
          {plan.cuisine}
        </span>
      </div>
      
      <div className="flex flex-col sm:flex-row items-end justify-between gap-6 mb-8">
        <div>
          <p className="text-sm text-muted-foreground uppercase tracking-wider font-bold mb-1">Daily Target</p>
          <div className="text-5xl font-display font-bold text-primary">
            {plan.plan.dailyCalorieTarget} <span className="text-xl text-primary/60">kcal</span>
          </div>
        </div>
        <div className="w-full sm:w-2/3">
          <div className="h-4 w-full bg-black/40 rounded-full overflow-hidden flex mb-2 border border-white/5">
            <div className="h-full bg-blue-500" style={{ width: `${(plan.plan.macros.proteinG * 4 / plan.plan.dailyCalorieTarget) * 100}%` }} />
            <div className="h-full bg-yellow-500" style={{ width: `${(plan.plan.macros.carbsG * 4 / plan.plan.dailyCalorieTarget) * 100}%` }} />
            <div className="h-full bg-red-500" style={{ width: `${(plan.plan.macros.fatG * 9 / plan.plan.dailyCalorieTarget) * 100}%` }} />
          </div>
          <div className="flex justify-between text-xs font-medium">
            <span className="text-blue-400">{plan.plan.macros.proteinG}g Protein</span>
            <span className="text-yellow-400">{plan.plan.macros.carbsG}g Carbs</span>
            <span className="text-red-400">{plan.plan.macros.fatG}g Fat</span>
          </div>
        </div>
      </div>

      <h3 className="text-xl font-display font-bold text-white px-2">Daily Meals</h3>
      <div className="space-y-4">
        {plan.plan.meals.map((meal, i) => (
          <div key={i} className="glass-panel p-5 sm:p-6 rounded-2xl relative overflow-hidden bg-[#111]">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-primary/80"></div>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="text-lg font-bold text-white">{meal.name}</h4>
                <div className="text-xs text-primary font-medium uppercase tracking-wider mt-1">{meal.time}</div>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-white">{meal.calories}</div>
                <div className="text-[10px] text-gray-500 uppercase tracking-widest">kcal</div>
              </div>
            </div>

            <ul className="list-disc list-inside space-y-1 text-gray-300 text-sm ml-4 mb-6">
              {meal.items.map((item, j) => <li key={j}>{item}</li>)}
            </ul>

            <div className="grid grid-cols-4 gap-2 bg-black/40 rounded-xl p-3 border border-white/5 text-center">
              <div>
                <div className="text-[10px] text-muted-foreground uppercase mb-1">Protein</div>
                <div className="text-sm font-medium text-blue-400">{meal.proteinG}g</div>
              </div>
              <div className="border-l border-white/10">
                <div className="text-[10px] text-muted-foreground uppercase mb-1">Carbs</div>
                <div className="text-sm font-medium text-yellow-400">{meal.carbsG}g</div>
              </div>
              <div className="border-l border-white/10">
                <div className="text-[10px] text-muted-foreground uppercase mb-1">Fat</div>
                <div className="text-sm font-medium text-red-400">{meal.fatG}g</div>
              </div>
              <div className="border-l border-white/10">
                <div className="text-[10px] text-muted-foreground uppercase mb-1">Fiber</div>
                <div className="text-sm font-medium text-green-400">{meal.fiberG}g</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="glass-panel p-5 rounded-2xl text-center bg-[#111]">
          <div className="text-sm text-gray-400 mb-1">Total Fiber</div>
          <div className="text-2xl font-bold text-white">{plan.plan.macros.fiberG}g</div>
        </div>
        <div className="glass-panel p-5 rounded-2xl text-center bg-[#111]">
          <div className="text-sm text-gray-400 mb-1">Total Sugar</div>
          <div className="text-2xl font-bold text-white">{plan.plan.macros.sugarG}g</div>
        </div>
      </div>

      <div className="glass-panel p-6 rounded-[1.5rem] mt-8 bg-[#111]">
        <div className="flex items-center justify-between mb-6 border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <Target className="w-5 h-5 text-primary" />
            <h3 className="text-xl font-display font-bold text-white">Shopping List</h3>
          </div>
          <span className="text-sm font-bold bg-primary/20 text-primary px-3 py-1 rounded-full">
            ~${plan.plan.estimatedWeeklyBudgetUSD} / wk
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {plan.plan.shoppingList.map((item, i) => (
            <div 
              key={i} 
              onClick={() => toggleCheck(item)}
              className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${checkedItems[item] ? 'bg-white/5 border-transparent opacity-50' : 'bg-black/40 border-white/5 hover:border-white/20'}`}
            >
              <div className={`w-5 h-5 rounded flex items-center justify-center border ${checkedItems[item] ? 'bg-primary border-primary text-black' : 'border-gray-500'}`}>
                {checkedItems[item] && <Check className="w-3 h-3" />}
              </div>
              <span className={`text-sm ${checkedItems[item] ? 'line-through text-gray-500' : 'text-gray-300'}`}>{item}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="glass-panel p-6 rounded-2xl border border-primary/30 bg-primary/5 flex gap-4">
        <Info className="w-6 h-6 text-primary shrink-0" />
        <div>
          <h4 className="font-bold text-white mb-1">Nutrition Protocol</h4>
          <p className="text-sm text-gray-300 italic">"{plan.plan.nutritionTips}"</p>
        </div>
      </div>
    </div>
  );
}
