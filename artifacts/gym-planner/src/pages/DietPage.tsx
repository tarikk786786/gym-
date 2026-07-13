import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Navbar } from "@/components/landing/Navbar";
import { Utensils, RefreshCw, ShoppingCart, Info, Flame, Save, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGenerateDietPlan } from "@workspace/api-client-react";
import type { SavedDietPlan } from "@workspace/api-client-react";
import { motion } from "framer-motion";

export default function DietPage() {
  const [, setLocation] = useLocation();
  const [formData, setFormData] = useState({
    cuisine: "International",
    dietStyle: "High Protein",
    calorieTarget: 2500,
    allergies: ""
  });
  
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  
  const generateMutation = useGenerateDietPlan();
  const [plan, setPlan] = useState<SavedDietPlan | null>(null);

  const handleGenerate = () => {
    generateMutation.mutate(
      { data: formData },
      {
        onSuccess: (result) => {
          setPlan(result);
          setCheckedItems({});
        }
      }
    );
  };

  const handleReset = () => {
    setPlan(null);
  };

  const toggleCheck = (item: string) => {
    setCheckedItems(prev => ({ ...prev, [item]: !prev[item] }));
  };

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-16 px-4 md:px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="flex flex-col lg:flex-row gap-8">
            
            {/* Form Panel */}
            <div className={`w-full ${plan ? 'lg:w-[40%]' : 'max-w-2xl mx-auto'} transition-all duration-500`}>
              <div className="glass-panel p-6 sm:p-8 rounded-[1.5rem] sticky top-24">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <Utensils className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-display font-bold text-white">AI Diet Planner</h1>
                    <p className="text-muted-foreground text-sm">Blueprint your weekly nutrition</p>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Cuisine */}
                  <div>
                    <label className="text-xs uppercase tracking-wider text-muted-foreground font-bold mb-3 block">Cuisine Preference</label>
                    <div className="grid grid-cols-2 gap-2">
                      {["International", "Mediterranean", "American", "Japanese", "Mexican", "Indian", "Chinese", "Middle Eastern"].map(cuisine => (
                        <button
                          key={cuisine}
                          onClick={() => setFormData({...formData, cuisine})}
                          className={`p-3 rounded-xl border text-sm font-medium transition-all text-left
                            ${formData.cuisine === cuisine ? 'bg-primary/10 border-primary text-white' : 'bg-black/40 border-white/5 text-gray-400 hover:border-white/20'}`}
                        >
                          {cuisine}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Diet Style */}
                  <div>
                    <label className="text-xs uppercase tracking-wider text-muted-foreground font-bold mb-3 block">Dietary Protocol</label>
                    <div className="flex flex-wrap gap-2">
                      {["Any", "High Protein", "Vegetarian", "Vegan", "Keto", "Paleo"].map(style => (
                        <button
                          key={style}
                          onClick={() => setFormData({...formData, dietStyle: style})}
                          className={`px-4 py-2 rounded-xl border text-sm font-medium transition-all
                            ${formData.dietStyle === style ? 'bg-primary/10 border-primary text-white' : 'bg-black/40 border-white/5 text-gray-400 hover:border-white/20'}`}
                        >
                          {style}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Calories & Allergies */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="text-xs uppercase tracking-wider text-muted-foreground font-bold mb-3 block">Daily Calories</label>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          className="border-white/10 bg-black/40 text-white w-10 h-12"
                          onClick={() => setFormData(f => ({ ...f, calorieTarget: Math.max(1200, f.calorieTarget - 50) }))}
                        >-</Button>
                        <div className="flex-1 bg-black/40 border border-white/10 rounded-xl h-12 flex items-center justify-center text-lg font-bold text-white">
                          {formData.calorieTarget}
                        </div>
                        <Button 
                          variant="outline" 
                          className="border-white/10 bg-black/40 text-white w-10 h-12"
                          onClick={() => setFormData(f => ({ ...f, calorieTarget: Math.min(4000, f.calorieTarget + 50) }))}
                        >+</Button>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs uppercase tracking-wider text-muted-foreground font-bold mb-3 block">Exclusions / Allergies</label>
                      <Input 
                        placeholder="e.g. nuts, dairy, gluten"
                        className="h-12 bg-black/40 border-white/10 text-white"
                        value={formData.allergies}
                        onChange={e => setFormData({...formData, allergies: e.target.value})}
                      />
                    </div>
                  </div>

                  <Button 
                    className="w-full h-14 text-lg font-bold bg-primary text-black hover:bg-yellow-500 rounded-xl"
                    onClick={handleGenerate}
                    disabled={generateMutation.isPending || !!plan}
                  >
                    {generateMutation.isPending ? "Generating Plan..." : "Generate My Meal Plan"}
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
                    <Utensils className="w-12 h-12 text-primary animate-pulse" />
                  </div>
                  <h3 className="text-2xl font-display font-bold text-white mb-2">Plating your macros...</h3>
                  <div className="h-6 overflow-hidden relative w-64 text-center">
                    <div className="animate-[slide-up_10s_infinite] flex flex-col text-primary/80 font-medium">
                      <span>Analyzing nutritional needs...</span>
                      <span>Selecting ingredients...</span>
                      <span>Balancing macros...</span>
                      <span>Building meal plan...</span>
                      <span>Calculating shopping list...</span>
                    </div>
                  </div>
                </div>
              )}

              {plan && (
                <div className="space-y-6 animate-in slide-in-from-bottom-8 duration-700">
                  {/* Overview Card */}
                  <div className="glass-panel p-6 sm:p-8 rounded-[1.5rem]">
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                      <div className="flex items-center gap-3">
                        <span className="px-3 py-1 bg-white/5 text-gray-300 text-xs font-bold uppercase tracking-wider rounded-full border border-white/10">
                          {plan.dietStyle}
                        </span>
                        <span className="px-3 py-1 bg-white/5 text-gray-300 text-xs font-bold uppercase tracking-wider rounded-full border border-white/10">
                          {plan.cuisine}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-green-400 text-sm font-medium px-3 py-1 bg-green-400/10 rounded-full border border-green-400/20">
                        <Check className="w-4 h-4" /> Saved to My Plans
                      </div>
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
                  </div>

                  {/* Meals */}
                  <h3 className="text-xl font-display font-bold text-white px-2">Daily Meals</h3>
                  <div className="space-y-4">
                    {plan.plan.meals.map((meal, i) => (
                      <div key={i} className="glass-panel p-5 sm:p-6 rounded-2xl relative overflow-hidden">
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

                  {/* Micro Summary */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="glass-panel p-5 rounded-2xl text-center">
                      <div className="text-sm text-gray-400 mb-1">Total Fiber</div>
                      <div className="text-2xl font-bold text-white">{plan.plan.macros.fiberG}g</div>
                    </div>
                    <div className="glass-panel p-5 rounded-2xl text-center">
                      <div className="text-sm text-gray-400 mb-1">Total Sugar</div>
                      <div className="text-2xl font-bold text-white">{plan.plan.macros.sugarG}g</div>
                    </div>
                  </div>

                  {/* Shopping List */}
                  <div className="glass-panel p-6 rounded-[1.5rem] mt-8">
                    <div className="flex items-center justify-between mb-6 border-b border-white/10 pb-4">
                      <div className="flex items-center gap-3">
                        <ShoppingCart className="w-5 h-5 text-primary" />
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

                  {/* Tips */}
                  <div className="glass-panel p-6 rounded-2xl border border-primary/30 bg-primary/5 flex gap-4">
                    <Info className="w-6 h-6 text-primary shrink-0" />
                    <div>
                      <h4 className="font-bold text-white mb-1">Nutrition Protocol</h4>
                      <p className="text-sm text-gray-300 italic">"{plan.plan.nutritionTips}"</p>
                    </div>
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
