import { useEffect, useState } from "react";
import { Navbar } from "@/components/landing/Navbar";
import { motion, useSpring, useTransform } from "framer-motion";
import { Activity, Droplets, Flame, Scale, Target, Timer, TrendingUp, Weight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

function AnimatedNumber({ value, prefix = "", suffix = "", decimals = 0 }: { value: number; prefix?: string; suffix?: string; decimals?: number }) {
  const spring = useSpring(value, { mass: 0.8, stiffness: 75, damping: 15 });
  const display = useTransform(spring, (current) => `${prefix}${current.toFixed(decimals)}${suffix}`);
  
  useEffect(() => {
    spring.set(value);
  }, [value, spring]);

  return <motion.span>{display}</motion.span>;
}

export default function CalculatorsPage() {
  return (
    <div className="min-h-[100dvh] bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-16 px-4 md:px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-12 text-center md:text-left">
            <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-3">
              Fitness Calculators
            </h1>
            <p className="text-xl text-primary font-medium tracking-wide">
              Precision tools for data-driven training
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <BMICalculator />
            <TDEECalculator />
            <MacroCalculator />
            <BodyFatCalculator />
            <IdealWeightCalculator />
            <WaterIntakeCalculator />
            <OneRepMaxCalculator />
            <CalorieBurnCalculator />
          </div>
        </div>
      </main>
    </div>
  );
}

function BMICalculator() {
  const [weight, setWeight] = useState<number>(75);
  const [height, setHeight] = useState<number>(175);
  
  const bmi = weight > 0 && height > 0 ? weight / Math.pow(height / 100, 2) : 0;
  
  let category = "Normal";
  let colorClass = "text-green-400 border-green-400/30 bg-green-400/10";
  let interpretation = "Your BMI is in the normal range. Aim to maintain your current weight.";
  if (bmi < 18.5) {
    category = "Underweight";
    colorClass = "text-blue-400 border-blue-400/30 bg-blue-400/10";
    interpretation = "You are underweight. Consider increasing your caloric intake healthily.";
  } else if (bmi >= 25 && bmi < 30) {
    category = "Overweight";
    colorClass = "text-yellow-400 border-yellow-400/30 bg-yellow-400/10";
    interpretation = "You are overweight. Consider a slight caloric deficit and more activity.";
  } else if (bmi >= 30) {
    category = "Obese";
    colorClass = "text-red-400 border-red-400/30 bg-red-400/10";
    interpretation = "You are in the obese range. Consult a professional for a health plan.";
  }

  return (
    <div className="glass-panel p-6 sm:p-8 flex flex-col rounded-[1.5rem]">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center">
          <Activity className="w-5 h-5 text-primary" />
        </div>
        <h2 className="text-2xl font-display font-bold text-white">BMI Calculator</h2>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="space-y-2">
          <Label className="text-muted-foreground text-xs uppercase tracking-wider">Weight (kg)</Label>
          <Input 
            type="number" 
            value={weight || ""} 
            onChange={e => setWeight(Number(e.target.value))} 
            className="h-12 bg-black/40 text-lg border-white/10"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-muted-foreground text-xs uppercase tracking-wider">Height (cm)</Label>
          <Input 
            type="number" 
            value={height || ""} 
            onChange={e => setHeight(Number(e.target.value))} 
            className="h-12 bg-black/40 text-lg border-white/10"
          />
        </div>
      </div>

      <div className="mt-auto bg-black/40 border border-white/5 rounded-2xl p-6">
        <div className="flex justify-between items-end mb-4">
          <div>
            <div className="text-sm text-muted-foreground font-medium mb-1">Your BMI</div>
            <div className="text-4xl font-display font-bold text-white">
              <AnimatedNumber value={bmi} decimals={1} />
            </div>
          </div>
          <div className={`px-3 py-1 rounded-full border text-xs font-bold uppercase tracking-wider ${colorClass}`}>
            {category}
          </div>
        </div>
        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden flex mb-4">
          <div className="h-full bg-blue-400" style={{ width: '18.5%' }} />
          <div className="h-full bg-green-400" style={{ width: '6.5%' }} />
          <div className="h-full bg-yellow-400" style={{ width: '5%' }} />
          <div className="h-full bg-red-400" style={{ width: '70%' }} />
        </div>
        <p className="text-sm text-gray-400">{interpretation}</p>
      </div>
    </div>
  );
}

function TDEECalculator() {
  const [weight, setWeight] = useState<number>(75);
  const [height, setHeight] = useState<number>(175);
  const [age, setAge] = useState<number>(30);
  const [gender, setGender] = useState<string>("male");
  const [activity, setActivity] = useState<string>("1.55"); // Mod active

  const bmr = 10 * weight + 6.25 * height - 5 * age + (gender === "male" ? 5 : -161);
  const tdee = Math.round(bmr * Number(activity));
  const fatLoss = tdee - 500;
  const muscleGain = tdee + 300;

  return (
    <div className="glass-panel p-6 sm:p-8 flex flex-col rounded-[1.5rem]">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center">
          <Flame className="w-5 h-5 text-primary" />
        </div>
        <h2 className="text-2xl font-display font-bold text-white">TDEE & Calories</h2>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="space-y-2">
          <Label className="text-muted-foreground text-xs uppercase tracking-wider">Weight (kg)</Label>
          <Input type="number" value={weight || ""} onChange={e => setWeight(Number(e.target.value))} className="h-12 bg-black/40 text-lg border-white/10" />
        </div>
        <div className="space-y-2">
          <Label className="text-muted-foreground text-xs uppercase tracking-wider">Height (cm)</Label>
          <Input type="number" value={height || ""} onChange={e => setHeight(Number(e.target.value))} className="h-12 bg-black/40 text-lg border-white/10" />
        </div>
        <div className="space-y-2">
          <Label className="text-muted-foreground text-xs uppercase tracking-wider">Age</Label>
          <Input type="number" value={age || ""} onChange={e => setAge(Number(e.target.value))} className="h-12 bg-black/40 text-lg border-white/10" />
        </div>
        <div className="space-y-2">
          <Label className="text-muted-foreground text-xs uppercase tracking-wider">Gender</Label>
          <Select value={gender} onValueChange={setGender}>
            <SelectTrigger className="h-12 bg-black/40 text-lg border-white/10"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="space-y-2 mb-8">
        <Label className="text-muted-foreground text-xs uppercase tracking-wider">Activity Level</Label>
        <Select value={activity} onValueChange={setActivity}>
          <SelectTrigger className="h-12 bg-black/40 text-sm border-white/10"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="1.2">Sedentary (office job)</SelectItem>
            <SelectItem value="1.375">Lightly Active (1-3 days/wk)</SelectItem>
            <SelectItem value="1.55">Moderately Active (3-5 days/wk)</SelectItem>
            <SelectItem value="1.725">Very Active (6-7 days/wk)</SelectItem>
            <SelectItem value="1.9">Athlete (2x per day)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="mt-auto bg-black/40 border border-white/5 rounded-2xl p-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="text-center sm:text-left border-b border-white/10 pb-4 sm:border-0 sm:pb-0">
            <div className="text-xs text-muted-foreground font-medium mb-1">Fat Loss</div>
            <div className="text-2xl font-display font-bold text-white"><AnimatedNumber value={fatLoss} /></div>
            <div className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">kcal/day</div>
          </div>
          <div className="text-center border-b border-white/10 pb-4 sm:border-0 sm:pb-0 sm:border-l sm:border-r border-white/10">
            <div className="text-xs text-primary font-medium mb-1">Maintenance</div>
            <div className="text-3xl font-display font-bold text-primary"><AnimatedNumber value={tdee} /></div>
            <div className="text-[10px] text-primary/60 uppercase tracking-widest mt-1">kcal/day</div>
          </div>
          <div className="text-center sm:text-right">
            <div className="text-xs text-muted-foreground font-medium mb-1">Muscle Gain</div>
            <div className="text-2xl font-display font-bold text-white"><AnimatedNumber value={muscleGain} /></div>
            <div className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">kcal/day</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MacroCalculator() {
  const [calories, setCalories] = useState<number>(2500);
  const [goal, setGoal] = useState<string>("maintenance");

  // Moderate macros standard:
  let proteinRatio = 0.3;
  let carbsRatio = 0.4;
  let fatRatio = 0.3;

  if (goal === "fatLoss") {
    proteinRatio = 0.4;
    carbsRatio = 0.3;
    fatRatio = 0.3;
  } else if (goal === "muscleGain") {
    proteinRatio = 0.3;
    carbsRatio = 0.5;
    fatRatio = 0.2;
  }

  const proteinG = (calories * proteinRatio) / 4;
  const carbsG = (calories * carbsRatio) / 4;
  const fatG = (calories * fatRatio) / 9;

  return (
    <div className="glass-panel p-6 sm:p-8 flex flex-col rounded-[1.5rem]">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center">
          <Target className="w-5 h-5 text-primary" />
        </div>
        <h2 className="text-2xl font-display font-bold text-white">Macro Calculator</h2>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="space-y-2">
          <Label className="text-muted-foreground text-xs uppercase tracking-wider">Calories</Label>
          <Input type="number" value={calories || ""} onChange={e => setCalories(Number(e.target.value))} className="h-12 bg-black/40 text-lg border-white/10" />
        </div>
        <div className="space-y-2">
          <Label className="text-muted-foreground text-xs uppercase tracking-wider">Goal</Label>
          <Select value={goal} onValueChange={setGoal}>
            <SelectTrigger className="h-12 bg-black/40 text-sm border-white/10"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="fatLoss">Fat Loss (Higher Protein)</SelectItem>
              <SelectItem value="maintenance">Maintenance (Balanced)</SelectItem>
              <SelectItem value="muscleGain">Muscle Gain (Higher Carbs)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mt-auto bg-black/40 border border-white/5 rounded-2xl p-6">
        <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden flex mb-6">
          <div className="h-full bg-blue-500" style={{ width: `${proteinRatio * 100}%` }} />
          <div className="h-full bg-yellow-500" style={{ width: `${carbsRatio * 100}%` }} />
          <div className="h-full bg-red-500" style={{ width: `${fatRatio * 100}%` }} />
        </div>
        
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <div className="text-sm font-medium text-blue-400 mb-1">Protein</div>
            <div className="text-xl font-bold text-white"><AnimatedNumber value={proteinG} suffix="g" /></div>
            <div className="text-xs text-gray-500">{proteinRatio * 100}%</div>
          </div>
          <div>
            <div className="text-sm font-medium text-yellow-400 mb-1">Carbs</div>
            <div className="text-xl font-bold text-white"><AnimatedNumber value={carbsG} suffix="g" /></div>
            <div className="text-xs text-gray-500">{carbsRatio * 100}%</div>
          </div>
          <div>
            <div className="text-sm font-medium text-red-400 mb-1">Fat</div>
            <div className="text-xl font-bold text-white"><AnimatedNumber value={fatG} suffix="g" /></div>
            <div className="text-xs text-gray-500">{fatRatio * 100}%</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function BodyFatCalculator() {
  const [gender, setGender] = useState("male");
  const [waist, setWaist] = useState(85);
  const [neck, setNeck] = useState(38);
  const [height, setHeight] = useState(175);
  const [hip, setHip] = useState(100);

  let bf = 0;
  if (waist > 0 && neck > 0 && height > 0) {
    if (gender === "male") {
      bf = 495 / (1.0324 - 0.19077 * Math.log10(waist - neck) + 0.15456 * Math.log10(height)) - 450;
    } else {
      bf = 495 / (1.29579 - 0.35004 * Math.log10(waist + hip - neck) + 0.22100 * Math.log10(height)) - 450;
    }
  }
  
  const validBf = isNaN(bf) || bf < 1 || bf > 70 ? 0 : bf;

  return (
    <div className="glass-panel p-6 sm:p-8 flex flex-col rounded-[1.5rem]">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center">
          <Weight className="w-5 h-5 text-primary" />
        </div>
        <h2 className="text-2xl font-display font-bold text-white">Body Fat % Estimator</h2>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="space-y-2">
          <Label className="text-muted-foreground text-xs uppercase tracking-wider">Gender</Label>
          <Select value={gender} onValueChange={setGender}>
            <SelectTrigger className="h-12 bg-black/40 text-sm border-white/10"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className="text-muted-foreground text-xs uppercase tracking-wider">Height (cm)</Label>
          <Input type="number" value={height || ""} onChange={e => setHeight(Number(e.target.value))} className="h-12 bg-black/40 border-white/10" />
        </div>
        <div className="space-y-2">
          <Label className="text-muted-foreground text-xs uppercase tracking-wider">Waist (cm)</Label>
          <Input type="number" value={waist || ""} onChange={e => setWaist(Number(e.target.value))} className="h-12 bg-black/40 border-white/10" />
        </div>
        <div className="space-y-2">
          <Label className="text-muted-foreground text-xs uppercase tracking-wider">Neck (cm)</Label>
          <Input type="number" value={neck || ""} onChange={e => setNeck(Number(e.target.value))} className="h-12 bg-black/40 border-white/10" />
        </div>
        {gender === "female" && (
          <div className="space-y-2 col-span-2">
            <Label className="text-muted-foreground text-xs uppercase tracking-wider">Hip (cm)</Label>
            <Input type="number" value={hip || ""} onChange={e => setHip(Number(e.target.value))} className="h-12 bg-black/40 border-white/10" />
          </div>
        )}
      </div>

      <div className="mt-auto bg-black/40 border border-white/5 rounded-2xl p-6 flex justify-between items-center">
        <div>
          <div className="text-sm text-muted-foreground font-medium mb-1">Estimated Body Fat</div>
          <p className="text-xs text-gray-500 mt-1 max-w-[200px]">Calculated using U.S. Navy Method</p>
        </div>
        <div className="text-4xl font-display font-bold text-primary">
          <AnimatedNumber value={validBf} decimals={1} suffix="%" />
        </div>
      </div>
    </div>
  );
}

function IdealWeightCalculator() {
  const [height, setHeight] = useState(175);
  const [gender, setGender] = useState("male");

  const heightInches = height / 2.54;
  let ideal = 0;
  if (heightInches > 60) {
    ideal = (gender === "male" ? 50 : 45.5) + 2.3 * (heightInches - 60);
  } else {
    ideal = gender === "male" ? 50 : 45.5; // fallback
  }

  const rangeLow = ideal * 0.9;
  const rangeHigh = ideal * 1.1;

  return (
    <div className="glass-panel p-6 sm:p-8 flex flex-col rounded-[1.5rem]">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center">
          <Scale className="w-5 h-5 text-primary" />
        </div>
        <h2 className="text-2xl font-display font-bold text-white">Ideal Weight</h2>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="space-y-2">
          <Label className="text-muted-foreground text-xs uppercase tracking-wider">Height (cm)</Label>
          <Input type="number" value={height || ""} onChange={e => setHeight(Number(e.target.value))} className="h-12 bg-black/40 text-lg border-white/10" />
        </div>
        <div className="space-y-2">
          <Label className="text-muted-foreground text-xs uppercase tracking-wider">Gender</Label>
          <Select value={gender} onValueChange={setGender}>
            <SelectTrigger className="h-12 bg-black/40 text-lg border-white/10"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mt-auto bg-black/40 border border-white/5 rounded-2xl p-6 text-center">
        <div className="text-sm text-muted-foreground font-medium mb-2">Ideal Weight Range</div>
        <div className="text-3xl font-display font-bold text-white flex items-center justify-center gap-2">
          <AnimatedNumber value={rangeLow} decimals={1} /> 
          <span className="text-primary text-xl">-</span>
          <AnimatedNumber value={rangeHigh} decimals={1} suffix=" kg" />
        </div>
        <p className="text-xs text-gray-500 mt-4">Based on Devine formula. Does not account for high muscle mass.</p>
      </div>
    </div>
  );
}

function WaterIntakeCalculator() {
  const [weight, setWeight] = useState(75);
  const [activity, setActivity] = useState(30);

  // ~35ml per kg, plus 500ml per 30 mins of exercise
  const baseLiters = (weight * 35) / 1000;
  const extraLiters = (activity / 30) * 0.5;
  const totalLiters = baseLiters + extraLiters;
  const glasses = Math.round(totalLiters * 1000 / 250);

  return (
    <div className="glass-panel p-6 sm:p-8 flex flex-col rounded-[1.5rem]">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center">
          <Droplets className="w-5 h-5 text-blue-400" />
        </div>
        <h2 className="text-2xl font-display font-bold text-white">Water Intake</h2>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="space-y-2">
          <Label className="text-muted-foreground text-xs uppercase tracking-wider">Weight (kg)</Label>
          <Input type="number" value={weight || ""} onChange={e => setWeight(Number(e.target.value))} className="h-12 bg-black/40 text-lg border-white/10" />
        </div>
        <div className="space-y-2">
          <Label className="text-muted-foreground text-xs uppercase tracking-wider">Daily Exercise (min)</Label>
          <Input type="number" value={activity || ""} onChange={e => setActivity(Number(e.target.value))} className="h-12 bg-black/40 text-lg border-white/10" />
        </div>
      </div>

      <div className="mt-auto bg-black/40 border border-white/5 rounded-2xl p-6">
        <div className="flex justify-between items-end mb-4">
          <div>
            <div className="text-sm text-muted-foreground font-medium mb-1">Daily Goal</div>
            <div className="text-4xl font-display font-bold text-white">
              <AnimatedNumber value={totalLiters} decimals={1} suffix=" L" />
            </div>
          </div>
          <div className="text-right">
            <div className="text-xl font-bold text-blue-400"><AnimatedNumber value={glasses} /></div>
            <div className="text-[10px] text-gray-500 uppercase tracking-widest">Glasses (250ml)</div>
          </div>
        </div>
        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-blue-500" 
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ duration: 1, repeat: Infinity, repeatType: "reverse", ease: "linear" }}
            style={{ originX: 0 }}
          />
        </div>
      </div>
    </div>
  );
}

function OneRepMaxCalculator() {
  const [weight, setWeight] = useState(100);
  const [reps, setReps] = useState(5);

  // Epley
  const oneRm = weight > 0 && reps > 0 ? weight * (1 + reps / 30) : 0;

  return (
    <div className="glass-panel p-6 sm:p-8 flex flex-col rounded-[1.5rem]">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center">
          <TrendingUp className="w-5 h-5 text-primary" />
        </div>
        <h2 className="text-2xl font-display font-bold text-white">One-Rep Max</h2>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="space-y-2">
          <Label className="text-muted-foreground text-xs uppercase tracking-wider">Weight Lifted (kg)</Label>
          <Input type="number" value={weight || ""} onChange={e => setWeight(Number(e.target.value))} className="h-12 bg-black/40 text-lg border-white/10" />
        </div>
        <div className="space-y-2">
          <Label className="text-muted-foreground text-xs uppercase tracking-wider">Reps Completed</Label>
          <Input type="number" value={reps || ""} onChange={e => setReps(Number(e.target.value))} className="h-12 bg-black/40 text-lg border-white/10" />
        </div>
      </div>

      <div className="mt-auto bg-black/40 border border-white/5 rounded-2xl p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="text-sm text-muted-foreground font-medium">Estimated 1RM</div>
          <div className="text-3xl font-display font-bold text-primary">
            <AnimatedNumber value={oneRm} decimals={1} suffix=" kg" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[95, 90, 85, 80, 75, 70].map(pct => (
            <div key={pct} className="bg-white/5 rounded-lg p-2 text-center border border-white/5">
              <div className="text-xs text-gray-400 mb-1">{pct}%</div>
              <div className="text-sm font-bold text-white">{(oneRm * pct / 100).toFixed(1)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CalorieBurnCalculator() {
  const [weight, setWeight] = useState(75);
  const [activity, setActivity] = useState("8.0"); // Running
  const [duration, setDuration] = useState(30);

  // MET * weight in kg * duration in hrs
  const calories = Number(activity) * weight * (duration / 60);

  return (
    <div className="glass-panel p-6 sm:p-8 flex flex-col rounded-[1.5rem]">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center">
          <Timer className="w-5 h-5 text-primary" />
        </div>
        <h2 className="text-2xl font-display font-bold text-white">Calorie Burn</h2>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="space-y-2">
          <Label className="text-muted-foreground text-xs uppercase tracking-wider">Weight (kg)</Label>
          <Input type="number" value={weight || ""} onChange={e => setWeight(Number(e.target.value))} className="h-12 bg-black/40 text-lg border-white/10" />
        </div>
        <div className="space-y-2">
          <Label className="text-muted-foreground text-xs uppercase tracking-wider">Duration (min)</Label>
          <Input type="number" value={duration || ""} onChange={e => setDuration(Number(e.target.value))} className="h-12 bg-black/40 text-lg border-white/10" />
        </div>
      </div>
      
      <div className="space-y-2 mb-8">
        <Label className="text-muted-foreground text-xs uppercase tracking-wider">Activity Type</Label>
        <Select value={activity} onValueChange={setActivity}>
          <SelectTrigger className="h-12 bg-black/40 text-sm border-white/10"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="8.0">Running (8 km/h)</SelectItem>
            <SelectItem value="7.5">Cycling (19-22 km/h)</SelectItem>
            <SelectItem value="6.0">Swimming (light effort)</SelectItem>
            <SelectItem value="3.5">Walking (moderate pace)</SelectItem>
            <SelectItem value="6.0">Weight Training (vigorous)</SelectItem>
            <SelectItem value="8.0">HIIT</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="mt-auto bg-black/40 border border-white/5 rounded-2xl p-6 flex justify-between items-center">
        <div>
          <div className="text-sm text-muted-foreground font-medium mb-1">Calories Burned</div>
          <p className="text-xs text-gray-500 mt-1">Based on MET values</p>
        </div>
        <div className="text-4xl font-display font-bold text-orange-400">
          <AnimatedNumber value={calories} />
        </div>
      </div>
    </div>
  );
}
