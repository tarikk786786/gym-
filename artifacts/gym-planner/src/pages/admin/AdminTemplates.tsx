import { useState } from "react";
import { useAdminWorkoutTemplates, useCreateWorkoutTemplate, useUpdateWorkoutTemplate, useDeleteWorkoutTemplate, useAdminDietTemplates, useCreateDietTemplate, useUpdateDietTemplate, useDeleteDietTemplate } from "@/lib/admin-api";
import { Plus, Trash2, Edit2, Dumbbell, Utensils } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

export default function AdminTemplates() {
  const [tab, setTab] = useState<"workout" | "diet">("workout");

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <h1 className="text-2xl font-display font-bold">Templates</h1>
        <div className="flex bg-[#1A1A1A] p-1 rounded-xl border border-white/10">
          <button
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === "workout" ? "bg-[#FFD700] text-black" : "text-gray-400 hover:text-white"}`}
            onClick={() => setTab("workout")}
          >
            <Dumbbell className="w-4 h-4" /> Workout
          </button>
          <button
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === "diet" ? "bg-[#FFD700] text-black" : "text-gray-400 hover:text-white"}`}
            onClick={() => setTab("diet")}
          >
            <Utensils className="w-4 h-4" /> Diet
          </button>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden min-h-[500px] flex flex-col">
        {tab === "workout" ? <WorkoutTemplatesTab /> : <DietTemplatesTab />}
      </div>
    </div>
  );
}

// ─── Workout Templates ────────────────────────────────────────────────────────

const defaultWorkoutForm = {
  title: "", description: "", goal: "muscle_gain",
  experience: "intermediate", split: "PPL", daysPerWeek: 4, location: "gym",
};

function WorkoutTemplatesTab() {
  const { data = [], isLoading } = useAdminWorkoutTemplates();
  const create = useCreateWorkoutTemplate();
  const update = useUpdateWorkoutTemplate();
  const del = useDeleteWorkoutTemplate();
  const { toast } = useToast();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState(defaultWorkoutForm);

  const handleOpen = (tpl?: any) => {
    if (tpl) {
      setEditing(tpl);
      setForm({
        title: tpl.title, description: tpl.description || "",
        goal: tpl.goal, experience: tpl.experience,
        split: tpl.split, daysPerWeek: tpl.daysPerWeek, location: tpl.location,
      });
    } else {
      setEditing(null);
      setForm(defaultWorkoutForm);
    }
    setModalOpen(true);
  };

  const handleSave = () => {
    if (!form.title) { toast({ title: "Error", description: "Title is required", variant: "destructive" }); return; }
    const payload = {
      title: form.title,
      description: form.description || null,
      goal: form.goal,
      experience: form.experience,
      split: form.split,
      daysPerWeek: form.daysPerWeek,
      location: form.location,
      plan: editing?.plan ?? {
        programName: form.title,
        duration: "4 weeks",
        overview: form.description || "A template workout plan.",
        weeklySchedule: [],
        progressionNotes: "Progressive overload — add 2.5 kg per week.",
      },
    };
    if (editing) {
      update.mutate({ id: editing.id, data: payload }, { onSuccess: () => { setModalOpen(false); toast({ title: "Updated" }); } });
    } else {
      create.mutate(payload, { onSuccess: () => { setModalOpen(false); toast({ title: "Created" }); } });
    }
  };

  return (
    <>
      <div className="p-4 border-b border-white/10 flex justify-end">
        <Button onClick={() => handleOpen()} className="bg-[#FFD700] hover:bg-yellow-500 text-black font-bold gap-2">
          <Plus className="w-4 h-4" /> Add Workout Template
        </Button>
      </div>
      <div className="flex-1 overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-[#1a1a1a] border-b border-white/10 text-xs uppercase text-gray-400">
            <tr>
              <th className="p-4">Title</th><th className="p-4">Goal</th>
              <th className="p-4">Exp.</th><th className="p-4">Split</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {isLoading ? (
              <tr><td colSpan={5} className="p-4 text-center text-gray-500">Loading...</td></tr>
            ) : data.length === 0 ? (
              <tr><td colSpan={5} className="p-4 text-center text-gray-500">No templates yet.</td></tr>
            ) : data.map((t: any) => (
              <tr key={t.id} className="bg-white/3 hover:bg-white/5">
                <td className="p-4 font-medium">{t.title}</td>
                <td className="p-4 text-gray-400 capitalize">{(t.goal || "").replace("_", " ")}</td>
                <td className="p-4 text-gray-400 capitalize">{t.experience}</td>
                <td className="p-4 text-gray-400">{t.split} ({t.daysPerWeek} days)</td>
                <td className="p-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => handleOpen(t)} className="p-1.5 text-gray-400 hover:text-white"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => del.mutate(t.id, { onSuccess: () => toast({ title: "Deleted" }) })} className="p-1.5 text-gray-400 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="bg-[#0A0A0A] border-white/10 text-white sm:max-w-[500px]">
          <DialogHeader><DialogTitle>{editing ? "Edit" : "Add"} Workout Template</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label className="text-xs text-gray-400">Title</label>
              <input className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-3 py-2 text-white" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-gray-400">Goal</label>
              <select className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-3 py-2 text-white" value={form.goal} onChange={e => setForm({ ...form, goal: e.target.value })}>
                <option value="muscle_gain">Muscle Gain</option>
                <option value="fat_loss">Fat Loss</option>
                <option value="strength">Strength</option>
                <option value="endurance">Endurance</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs text-gray-400">Experience</label>
                <select className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-3 py-2 text-white" value={form.experience} onChange={e => setForm({ ...form, experience: e.target.value })}>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs text-gray-400">Days / week</label>
                <input type="number" min={1} max={7} className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-3 py-2 text-white" value={form.daysPerWeek} onChange={e => setForm({ ...form, daysPerWeek: +e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs text-gray-400">Split</label>
                <select className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-3 py-2 text-white" value={form.split} onChange={e => setForm({ ...form, split: e.target.value })}>
                  <option value="PPL">PPL</option>
                  <option value="Bro Split">Bro Split</option>
                  <option value="Full Body">Full Body</option>
                  <option value="Upper/Lower">Upper/Lower</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs text-gray-400">Location</label>
                <select className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-3 py-2 text-white" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })}>
                  <option value="gym">Gym</option>
                  <option value="home">Home</option>
                </select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSave} className="bg-[#FFD700] text-black hover:bg-yellow-500">Save Template</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ─── Diet Templates ───────────────────────────────────────────────────────────

const defaultDietForm = {
  title: "", description: "", cuisine: "any", dietStyle: "balanced",
  allergies: "", calorieTarget: 2500,
};

function DietTemplatesTab() {
  const { data = [], isLoading } = useAdminDietTemplates();
  const create = useCreateDietTemplate();
  const update = useUpdateDietTemplate();
  const del = useDeleteDietTemplate();
  const { toast } = useToast();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState(defaultDietForm);

  const handleOpen = (tpl?: any) => {
    if (tpl) {
      setEditing(tpl);
      setForm({
        title: tpl.title, description: tpl.description || "",
        cuisine: tpl.cuisine, dietStyle: tpl.dietStyle,
        allergies: tpl.allergies || "", calorieTarget: tpl.calorieTarget,
      });
    } else {
      setEditing(null);
      setForm(defaultDietForm);
    }
    setModalOpen(true);
  };

  const handleSave = () => {
    if (!form.title) { toast({ title: "Error", description: "Title is required", variant: "destructive" }); return; }
    const cals = form.calorieTarget;
    const payload = {
      title: form.title,
      description: form.description || null,
      cuisine: form.cuisine,
      dietStyle: form.dietStyle,
      calorieTarget: cals,
      allergies: form.allergies || null,
      plan: editing?.plan ?? {
        dailyCalorieTarget: cals,
        macros: {
          proteinG: Math.round(cals * 0.3 / 4),
          carbsG: Math.round(cals * 0.4 / 4),
          fatG: Math.round(cals * 0.3 / 9),
          fiberG: 30, sugarG: 50,
        },
        meals: [], shoppingList: [],
        estimatedWeeklyBudgetUSD: 80,
        nutritionTips: "Eat whole foods. Stay hydrated.",
      },
    };
    if (editing) {
      update.mutate({ id: editing.id, data: payload }, { onSuccess: () => { setModalOpen(false); toast({ title: "Updated" }); } });
    } else {
      create.mutate(payload, { onSuccess: () => { setModalOpen(false); toast({ title: "Created" }); } });
    }
  };

  return (
    <>
      <div className="p-4 border-b border-white/10 flex justify-end">
        <Button onClick={() => handleOpen()} className="bg-[#FFD700] hover:bg-yellow-500 text-black font-bold gap-2">
          <Plus className="w-4 h-4" /> Add Diet Template
        </Button>
      </div>
      <div className="flex-1 overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-[#1a1a1a] border-b border-white/10 text-xs uppercase text-gray-400">
            <tr>
              <th className="p-4">Title</th><th className="p-4">Cuisine</th>
              <th className="p-4">Diet Style</th><th className="p-4">Calories</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {isLoading ? (
              <tr><td colSpan={5} className="p-4 text-center text-gray-500">Loading...</td></tr>
            ) : data.length === 0 ? (
              <tr><td colSpan={5} className="p-4 text-center text-gray-500">No templates yet.</td></tr>
            ) : data.map((t: any) => (
              <tr key={t.id} className="bg-white/3 hover:bg-white/5">
                <td className="p-4 font-medium">{t.title}</td>
                <td className="p-4 text-gray-400 capitalize">{t.cuisine}</td>
                <td className="p-4 text-gray-400 capitalize">{t.dietStyle}</td>
                <td className="p-4 text-gray-400">{t.calorieTarget} kcal</td>
                <td className="p-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => handleOpen(t)} className="p-1.5 text-gray-400 hover:text-white"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => del.mutate(t.id, { onSuccess: () => toast({ title: "Deleted" }) })} className="p-1.5 text-gray-400 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="bg-[#0A0A0A] border-white/10 text-white sm:max-w-[500px]">
          <DialogHeader><DialogTitle>{editing ? "Edit" : "Add"} Diet Template</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label className="text-xs text-gray-400">Title</label>
              <input className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-3 py-2 text-white" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs text-gray-400">Cuisine</label>
                <select className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-3 py-2 text-white" value={form.cuisine} onChange={e => setForm({ ...form, cuisine: e.target.value })}>
                  <option value="any">Any</option>
                  <option value="mediterranean">Mediterranean</option>
                  <option value="asian">Asian</option>
                  <option value="american">American</option>
                  <option value="middle_eastern">Middle Eastern</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs text-gray-400">Diet Style</label>
                <select className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-3 py-2 text-white" value={form.dietStyle} onChange={e => setForm({ ...form, dietStyle: e.target.value })}>
                  <option value="balanced">Balanced</option>
                  <option value="high_protein">High Protein</option>
                  <option value="keto">Keto</option>
                  <option value="vegetarian">Vegetarian</option>
                  <option value="vegan">Vegan</option>
                  <option value="low_carb">Low Carb</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs text-gray-400">Calorie Target</label>
              <input type="number" min={1000} max={6000} className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-3 py-2 text-white" value={form.calorieTarget} onChange={e => setForm({ ...form, calorieTarget: +e.target.value })} />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-gray-400">Allergies / Restrictions</label>
              <input className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-3 py-2 text-white" placeholder="e.g. nuts, dairy" value={form.allergies} onChange={e => setForm({ ...form, allergies: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSave} className="bg-[#FFD700] text-black hover:bg-yellow-500">Save Template</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
