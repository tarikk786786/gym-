import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Navbar } from "@/components/landing/Navbar";
import { 
  Plus, Calendar, Activity, Flame, Droplets, Moon, Trophy, 
  Trash2, PlusCircle, TrendingUp, Target, Award, Shield, CheckCircle2 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, CartesianGrid } from 'recharts';
import { 
  useListProgressLogs, useCreateProgressLog, useGetProgressSummary,
  useListPrRecords, useCreatePrRecord, useDeletePrRecord,
  getListProgressLogsQueryKey, getGetProgressSummaryQueryKey, getListPrRecordsQueryKey
} from "@workspace/api-client-react";

export default function ProgressPage() {
  const queryClient = useQueryClient();
  const [isAddLogOpen, setIsAddLogOpen] = useState(false);
  const [activeBodyMetric, setActiveBodyMetric] = useState("chestCm");

  // Queries
  const { data: logs = [] } = useListProgressLogs();
  const { data: summary } = useGetProgressSummary();
  const { data: prRecords = [] } = useListPrRecords();

  // Mutations
  const createLog = useCreateProgressLog();
  const createPr = useCreatePrRecord();
  const deletePr = useDeletePrRecord();

  const handleLogSuccess = () => {
    queryClient.invalidateQueries({ queryKey: getListProgressLogsQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetProgressSummaryQueryKey() });
    setIsAddLogOpen(false);
  };

  const handlePrSuccess = () => {
    queryClient.invalidateQueries({ queryKey: getListPrRecordsQueryKey() });
  };

  const handleDeletePr = (id: string) => {
    deletePr.mutate({ id }, { onSuccess: handlePrSuccess });
  };

  // Chart Data Formatting
  const weightData = logs
    .filter(log => log.weightKg != null)
    .sort((a, b) => new Date(a.logDate).getTime() - new Date(b.logDate).getTime())
    .slice(-30)
    .map(log => ({
      date: new Date(log.logDate).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      weight: log.weightKg
    }));

  const caloriesData = logs
    .filter(log => log.caloriesConsumed != null)
    .sort((a, b) => new Date(a.logDate).getTime() - new Date(b.logDate).getTime())
    .slice(-30)
    .map(log => ({
      date: new Date(log.logDate).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      calories: log.caloriesConsumed
    }));

  const bodyMetricsData = logs
    .filter(log => log[activeBodyMetric as keyof typeof log] != null)
    .sort((a, b) => new Date(a.logDate).getTime() - new Date(b.logDate).getTime())
    .slice(-30)
    .map(log => ({
      date: new Date(log.logDate).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      value: log[activeBodyMetric as keyof typeof log]
    }));

  const recentLogs = [...logs].sort((a, b) => new Date(b.logDate).getTime() - new Date(a.logDate).getTime());
  const measurementLogs = recentLogs.filter(log => 
    log.chestCm || log.waistCm || log.hipsCm || log.armsCm || log.thighsCm || log.shouldersCm
  );

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col relative pb-20 md:pb-0">
      <Navbar />

      <main className="flex-1 pt-20 md:pt-24 pb-28 md:pb-16 px-4 md:px-6">
        <div className="container mx-auto max-w-7xl">
          
          {/* Header & Stats Bar */}
          <div className="mb-6 md:mb-10">
            <h1 className="text-2xl md:text-5xl font-display font-bold text-white mb-4 md:mb-8">
              Progress <span className="text-primary text-glow">Tracker</span>
            </h1>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              <div className="glass-panel p-4 rounded-2xl border-l-4 border-l-primary flex flex-col gap-0.5">
                <span className="text-[10px] md:text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1"><Flame className="w-3 h-3 text-orange-500" /> Streak</span>
                <span className="text-2xl md:text-3xl font-display font-bold text-white">{summary?.streak || 0} <span className="text-xs text-gray-500 font-normal">days</span></span>
              </div>
              <div className="glass-panel p-4 rounded-2xl flex flex-col gap-0.5">
                <span className="text-[10px] md:text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1"><Activity className="w-3 h-3 text-blue-400" /> Total Logs</span>
                <span className="text-2xl md:text-3xl font-display font-bold text-white">{summary?.totalLogs || 0}</span>
              </div>
              <div className="glass-panel p-4 rounded-2xl flex flex-col gap-0.5">
                <span className="text-[10px] md:text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1"><Target className="w-3 h-3 text-green-400" /> Weight</span>
                <span className="text-2xl md:text-3xl font-display font-bold text-white">{recentLogs.find(l => l.weightKg)?.weightKg || '--'} <span className="text-xs text-gray-500 font-normal">kg</span></span>
              </div>
              <div className="glass-panel p-4 rounded-2xl flex flex-col gap-0.5">
                <span className="text-[10px] md:text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1"><Calendar className="w-3 h-3 text-purple-400" /> Last Workout</span>
                <span className="text-base md:text-xl font-bold text-white mt-0.5">
                  {recentLogs.find(l => l.workoutCompleted)?.logDate 
                    ? new Date(recentLogs.find(l => l.workoutCompleted)!.logDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                    : 'None yet'}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Left Column: Charts */}
            <div className="space-y-8">
              <div className="glass-panel p-6 sm:p-8 rounded-[2rem]">
                <h3 className="text-xl font-display font-bold text-white mb-6 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" /> Weight Trend
                </h3>
                <div className="h-[250px] w-full">
                  {weightData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={weightData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                        <XAxis dataKey="date" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#888" fontSize={12} tickLine={false} axisLine={false} domain={['dataMin - 2', 'dataMax + 2']} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: 'rgba(0,0,0,0.9)', border: '1px solid rgba(255, 215, 0, 0.3)', borderRadius: '12px', color: '#fff' }}
                          itemStyle={{ color: '#FFD700', fontWeight: 'bold' }}
                        />
                        <Line type="monotone" dataKey="weight" stroke="#FFD700" strokeWidth={3} dot={{ r: 4, fill: '#000', stroke: '#FFD700', strokeWidth: 2 }} activeDot={{ r: 6, fill: '#FFD700' }} />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-500 text-sm">Not enough data yet</div>
                  )}
                </div>
              </div>

              <div className="glass-panel p-6 sm:p-8 rounded-[2rem]">
                <h3 className="text-xl font-display font-bold text-white mb-6 flex items-center gap-2">
                  <Flame className="w-5 h-5 text-orange-500" /> Calories Over Time
                </h3>
                <div className="h-[250px] w-full">
                  {caloriesData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={caloriesData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                        <XAxis dataKey="date" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: 'rgba(0,0,0,0.9)', border: '1px solid rgba(255, 215, 0, 0.3)', borderRadius: '12px', color: '#fff' }}
                        />
                        <Line type="monotone" dataKey="calories" stroke="#f97316" strokeWidth={3} dot={false} activeDot={{ r: 6, fill: '#f97316' }} />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-500 text-sm">Not enough data yet</div>
                  )}
                </div>
              </div>

              <div className="glass-panel p-6 sm:p-8 rounded-[2rem]">
                <h3 className="text-xl font-display font-bold text-white mb-6">Body Measurements</h3>
                <Tabs defaultValue="chestCm" onValueChange={setActiveBodyMetric}>
                  <TabsList className="w-full bg-black/40 border border-white/10 p-1 rounded-xl flex overflow-x-auto h-auto min-h-12 mb-6">
                    {[
                      { id: "chestCm", label: "Chest" },
                      { id: "waistCm", label: "Waist" },
                      { id: "armsCm", label: "Arms" },
                      { id: "thighsCm", label: "Thighs" },
                      { id: "shouldersCm", label: "Shoulders" }
                    ].map(t => (
                      <TabsTrigger key={t.id} value={t.id} className="flex-1 min-w-[80px] rounded-lg data-[state=active]:bg-primary data-[state=active]:text-black text-gray-400 py-2 text-sm font-medium">
                        {t.label}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  <div className="h-[200px] w-full">
                    {bodyMetricsData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={bodyMetricsData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                          <XAxis dataKey="date" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                          <YAxis stroke="#888" fontSize={12} tickLine={false} axisLine={false} domain={['dataMin - 1', 'dataMax + 1']} />
                          <Tooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.9)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '12px', color: '#fff' }} />
                          <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={3} dot={{ r: 3, fill: '#000', stroke: '#3b82f6', strokeWidth: 2 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-gray-500 text-sm">Not enough data yet</div>
                    )}
                  </div>
                </Tabs>
              </div>
            </div>

            {/* Right Column: Habits & Tables */}
            <div className="space-y-8">
              
              {/* Habits Averages */}
              <div className="grid grid-cols-2 gap-4">
                <div className="glass-panel p-6 rounded-2xl flex flex-col items-center justify-center text-center">
                  <div className="w-12 h-12 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center mb-3">
                    <Droplets className="w-6 h-6 text-blue-400" />
                  </div>
                  <div className="text-sm text-gray-400 font-medium mb-1">Water Avg</div>
                  <div className="text-2xl font-display font-bold text-white">{summary?.allTime?.avgWaterLiters?.toFixed(1) || 0}L</div>
                </div>
                <div className="glass-panel p-6 rounded-2xl flex flex-col items-center justify-center text-center">
                  <div className="w-12 h-12 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center mb-3">
                    <Moon className="w-6 h-6 text-purple-400" />
                  </div>
                  <div className="text-sm text-gray-400 font-medium mb-1">Sleep Avg</div>
                  <div className="text-2xl font-display font-bold text-white">{summary?.allTime?.avgSleepHours?.toFixed(1) || 0}h</div>
                </div>
              </div>

              {/* Achievements */}
              <div className="glass-panel p-6 rounded-[2rem]">
                <h3 className="text-xl font-display font-bold text-white mb-4">Achievements</h3>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                  <Badge icon={Shield} label="First Log" unlocked={summary?.totalLogs ? summary.totalLogs >= 1 : false} />
                  <Badge icon={Flame} label="Week Warrior" unlocked={summary?.streak ? summary.streak >= 7 : false} />
                  <Badge icon={Award} label="Consistent" unlocked={summary?.totalLogs ? summary.totalLogs >= 30 : false} />
                  <Badge icon={Trophy} label="Heavy Lifter" unlocked={prRecords.length > 0} />
                  <Badge icon={Droplets} label="Hydration Hero" unlocked={summary?.allTime?.avgWaterLiters ? summary.allTime.avgWaterLiters >= 3 : false} />
                  <Badge icon={Moon} label="Sleep Champ" unlocked={summary?.allTime?.avgSleepHours ? summary.allTime.avgSleepHours >= 8 : false} />
                </div>
              </div>

              {/* Measurement Table */}
              <div className="glass-panel rounded-[2rem] overflow-hidden">
                <div className="p-6 border-b border-white/10">
                  <h3 className="text-xl font-display font-bold text-white">Measurement History</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-400 uppercase bg-black/40 border-b border-white/10">
                      <tr>
                        <th className="px-6 py-4 font-bold">Date</th>
                        <th className="px-4 py-4 font-bold">Chest</th>
                        <th className="px-4 py-4 font-bold">Waist</th>
                        <th className="px-4 py-4 font-bold">Arms</th>
                        <th className="px-4 py-4 font-bold">Legs</th>
                      </tr>
                    </thead>
                    <tbody>
                      {measurementLogs.slice(0, 5).map((log, i) => (
                        <tr key={log.id} className={`border-b border-white/5 hover:bg-white/5 transition-colors ${i === 0 ? 'bg-primary/5' : ''}`}>
                          <td className={`px-6 py-4 font-medium ${i === 0 ? 'text-primary' : 'text-gray-300'}`}>
                            {new Date(log.logDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                          </td>
                          <td className="px-4 py-4 text-gray-400">{log.chestCm || '-'}</td>
                          <td className="px-4 py-4 text-gray-400">{log.waistCm || '-'}</td>
                          <td className="px-4 py-4 text-gray-400">{log.armsCm || '-'}</td>
                          <td className="px-4 py-4 text-gray-400">{log.thighsCm || '-'}</td>
                        </tr>
                      ))}
                      {measurementLogs.length === 0 && (
                        <tr>
                          <td colSpan={5} className="px-6 py-8 text-center text-gray-500">No measurements recorded yet.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* PR Section */}
              <div className="glass-panel p-6 rounded-[2rem]">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-display font-bold text-white flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-primary" /> Personal Records
                  </h3>
                  <PrForm onSubmit={(data) => createPr.mutate({ data }, { onSuccess: handlePrSuccess })} />
                </div>
                
                <div className="space-y-3">
                  {prRecords.map(pr => (
                    <div key={pr.id} className="bg-black/40 border border-white/10 rounded-xl p-4 flex items-center justify-between group">
                      <div>
                        <h4 className="font-bold text-white text-lg">{pr.exercise}</h4>
                        <div className="flex items-center gap-3 text-sm mt-1">
                          <span className="text-primary font-bold">{pr.weightKg} kg</span>
                          <span className="text-gray-500">× {pr.reps} reps</span>
                          <span className="text-gray-600 text-xs px-2 py-0.5 bg-white/5 rounded-full">{new Date(pr.achievedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleDeletePr(pr.id)}
                        className="w-8 h-8 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-400/10 flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {prRecords.length === 0 && (
                    <div className="text-center py-6 text-gray-500 text-sm bg-black/20 rounded-xl border border-white/5">
                      No personal records yet. Crush your next workout!
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      </main>

      {/* Floating Add Button — above CoachWidget on mobile */}
      <Dialog open={isAddLogOpen} onOpenChange={setIsAddLogOpen}>
        <DialogTrigger asChild>
          <button className="fixed bottom-24 right-4 sm:bottom-24 sm:right-6 md:bottom-10 md:right-10 w-14 h-14 md:w-16 md:h-16 bg-primary text-black rounded-full shadow-2xl hover:scale-105 transition-transform flex items-center justify-center z-40 border-4 border-black group">
            <Plus className="w-8 h-8 group-hover:rotate-90 transition-transform duration-300" />
          </button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[500px] bg-[#0A0A0A] border-white/10 text-white rounded-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-2xl font-display font-bold">Log Progress</DialogTitle>
          </DialogHeader>
          <AddLogForm onSubmit={(data) => createLog.mutate({ data }, { onSuccess: handleLogSuccess })} isPending={createLog.isPending} />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Badge({ icon: Icon, label, unlocked }: { icon: any, label: string, unlocked: boolean }) {
  return (
    <div className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-500
      ${unlocked 
        ? 'bg-primary/10 border-primary/30 shadow-[0_0_15px_rgba(255,215,0,0.15)]' 
        : 'bg-white/5 border-white/5 opacity-50 grayscale'}`}>
      <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 
        ${unlocked ? 'bg-primary/20 text-primary' : 'bg-black text-gray-500'}`}>
        <Icon className="w-5 h-5" />
      </div>
      <span className={`text-[10px] font-bold text-center leading-tight ${unlocked ? 'text-white' : 'text-gray-500'}`}>{label}</span>
    </div>
  );
}

function PrForm({ onSubmit }: { onSubmit: (data: any) => void }) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({ exercise: "", weightKg: "", reps: "", achievedAt: new Date().toISOString().split('T')[0] });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.exercise || !formData.weightKg || !formData.reps) return;
    onSubmit({
      exercise: formData.exercise,
      weightKg: Number(formData.weightKg),
      reps: Number(formData.reps),
      achievedAt: new Date(formData.achievedAt).toISOString()
    });
    setFormData({ exercise: "", weightKg: "", reps: "", achievedAt: new Date().toISOString().split('T')[0] });
    setOpen(false);
  };

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)} variant="outline" size="sm" className="border-primary/40 text-primary hover:bg-primary/10 h-8 rounded-lg">
        <Plus className="w-4 h-4 mr-1" /> Add PR
      </Button>
    );
  }

  return (
    <div className="absolute inset-0 z-10 bg-[#0a0a0a] rounded-[2rem] p-6 border border-white/10 animate-in fade-in zoom-in-95 flex flex-col justify-center">
      <h4 className="font-bold text-white mb-4">Record New PR</h4>
      <form onSubmit={handleSubmit} className="space-y-3">
        <Input 
          placeholder="Exercise (e.g. Bench Press)" 
          className="bg-black/40 border-white/10 text-white"
          value={formData.exercise} onChange={e => setFormData(f => ({...f, exercise: e.target.value}))}
          required
        />
        <div className="grid grid-cols-2 gap-3">
          <Input 
            type="number" placeholder="Weight (kg)" step="0.5" 
            className="bg-black/40 border-white/10 text-white"
            value={formData.weightKg} onChange={e => setFormData(f => ({...f, weightKg: e.target.value}))}
            required
          />
          <Input 
            type="number" placeholder="Reps" 
            className="bg-black/40 border-white/10 text-white"
            value={formData.reps} onChange={e => setFormData(f => ({...f, reps: e.target.value}))}
            required
          />
        </div>
        <div className="flex gap-2 pt-2">
          <Button type="submit" className="flex-1 bg-primary text-black font-bold hover:bg-yellow-500">Save PR</Button>
          <Button type="button" variant="outline" onClick={() => setOpen(false)} className="border-white/10 hover:bg-white/5">Cancel</Button>
        </div>
      </form>
    </div>
  );
}

function AddLogForm({ onSubmit, isPending }: { onSubmit: (data: any) => void, isPending: boolean }) {
  const [formData, setFormData] = useState<any>({
    logDate: new Date().toISOString().split('T')[0],
    weightKg: "",
    bodyFatPercent: "",
    caloriesConsumed: "",
    waterLiters: "",
    sleepHours: "",
    workoutCompleted: false,
    workoutDurationMin: "",
    mood: "Good",
    notes: ""
  });

  const moods = ["Great", "Good", "Okay", "Bad", "Low energy"];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      logDate: new Date(formData.logDate).toISOString(),
      weightKg: formData.weightKg ? Number(formData.weightKg) : undefined,
      bodyFatPercent: formData.bodyFatPercent ? Number(formData.bodyFatPercent) : undefined,
      caloriesConsumed: formData.caloriesConsumed ? Number(formData.caloriesConsumed) : undefined,
      waterLiters: formData.waterLiters ? Number(formData.waterLiters) : undefined,
      sleepHours: formData.sleepHours ? Number(formData.sleepHours) : undefined,
      workoutCompleted: formData.workoutCompleted,
      workoutDurationMin: formData.workoutDurationMin ? Number(formData.workoutDurationMin) : undefined,
      mood: formData.mood,
      notes: formData.notes || undefined
    };
    // remove undefined
    Object.keys(payload).forEach(key => (payload as Record<string, unknown>)[key] === undefined && delete (payload as Record<string, unknown>)[key]);
    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 pb-4">
      <div>
        <label className="text-xs uppercase tracking-wider text-muted-foreground font-bold mb-2 block">Date</label>
        <Input 
          type="date" 
          required
          className="bg-[#1A1A1A] border-white/10 text-white rounded-xl h-12"
          value={formData.logDate}
          onChange={e => setFormData({...formData, logDate: e.target.value})}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs uppercase tracking-wider text-muted-foreground font-bold mb-2 block">Weight (kg)</label>
          <Input 
            type="number" step="0.1"
            className="bg-[#1A1A1A] border-white/10 text-white rounded-xl h-12"
            value={formData.weightKg}
            onChange={e => setFormData({...formData, weightKg: e.target.value})}
          />
        </div>
        <div>
          <label className="text-xs uppercase tracking-wider text-muted-foreground font-bold mb-2 block">Body Fat %</label>
          <Input 
            type="number" step="0.1"
            className="bg-[#1A1A1A] border-white/10 text-white rounded-xl h-12"
            value={formData.bodyFatPercent}
            onChange={e => setFormData({...formData, bodyFatPercent: e.target.value})}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="text-xs uppercase tracking-wider text-muted-foreground font-bold mb-2 block">Calories</label>
          <Input 
            type="number" 
            className="bg-[#1A1A1A] border-white/10 text-white rounded-xl h-12 text-center"
            value={formData.caloriesConsumed}
            onChange={e => setFormData({...formData, caloriesConsumed: e.target.value})}
          />
        </div>
        <div>
          <label className="text-xs uppercase tracking-wider text-muted-foreground font-bold mb-2 block">Water (L)</label>
          <Input 
            type="number" step="0.1"
            className="bg-[#1A1A1A] border-white/10 text-white rounded-xl h-12 text-center"
            value={formData.waterLiters}
            onChange={e => setFormData({...formData, waterLiters: e.target.value})}
          />
        </div>
        <div>
          <label className="text-xs uppercase tracking-wider text-muted-foreground font-bold mb-2 block">Sleep (h)</label>
          <Input 
            type="number" step="0.5"
            className="bg-[#1A1A1A] border-white/10 text-white rounded-xl h-12 text-center"
            value={formData.sleepHours}
            onChange={e => setFormData({...formData, sleepHours: e.target.value})}
          />
        </div>
      </div>

      <div className="bg-[#1A1A1A] border border-white/10 rounded-xl p-4">
        <label className="flex items-center gap-3 cursor-pointer">
          <div className={`w-6 h-6 rounded-md border flex items-center justify-center transition-colors
            ${formData.workoutCompleted ? 'bg-primary border-primary text-black' : 'border-white/20'}`}>
            {formData.workoutCompleted && <CheckCircle2 className="w-4 h-4" />}
          </div>
          <span className="text-sm font-bold text-white select-none">Workout Completed Today</span>
          <input 
            type="checkbox" 
            className="hidden"
            checked={formData.workoutCompleted}
            onChange={e => setFormData({...formData, workoutCompleted: e.target.checked})}
          />
        </label>
        
        {formData.workoutCompleted && (
          <div className="mt-4 pt-4 border-t border-white/10 animate-in slide-in-from-top-2">
            <label className="text-xs uppercase tracking-wider text-muted-foreground font-bold mb-2 block">Duration (mins)</label>
            <Input 
              type="number" 
              className="bg-black/50 border-white/10 text-white rounded-xl"
              value={formData.workoutDurationMin}
              onChange={e => setFormData({...formData, workoutDurationMin: e.target.value})}
            />
          </div>
        )}
      </div>

      <div>
        <label className="text-xs uppercase tracking-wider text-muted-foreground font-bold mb-2 block">Mood</label>
        <div className="flex flex-wrap gap-2">
          {moods.map(m => (
            <button
              key={m} type="button"
              onClick={() => setFormData({...formData, mood: m})}
              className={`px-4 py-2 rounded-xl border text-sm font-medium transition-all
                ${formData.mood === m ? 'bg-primary/20 border-primary/50 text-white' : 'bg-black/40 border-white/10 text-gray-400 hover:border-white/30'}`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-xs uppercase tracking-wider text-muted-foreground font-bold mb-2 block">Notes</label>
        <Textarea 
          placeholder="How did you feel today?"
          className="bg-[#1A1A1A] border-white/10 text-white rounded-xl resize-none h-20"
          value={formData.notes}
          onChange={e => setFormData({...formData, notes: e.target.value})}
        />
      </div>

      <Button type="submit" disabled={isPending} className="w-full h-14 text-lg font-bold bg-primary text-black hover:bg-yellow-500 rounded-xl mt-4">
        {isPending ? "Saving..." : "Save Log"}
      </Button>
    </form>
  );
}
