import { useAdminStats } from "@/lib/admin-api";
import { Users, Dumbbell, TrendingUp, Calendar, Mail, Send, FileText, Layers, AlertCircle } from "lucide-react";
import { AreaChart, Area, ResponsiveContainer } from "recharts";
import { Link } from "wouter";

const dummyChartData = Array.from({ length: 10 }, (_, i) => ({ value: 10 + Math.random() * 20 }));

function Sparkline() {
  return (
    <div className="h-10 mt-4 opacity-50">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={dummyChartData}>
          <defs>
            <linearGradient id="colorGold" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#FFD700" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#FFD700" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <Area type="monotone" dataKey="value" stroke="#FFD700" fillOpacity={1} fill="url(#colorGold)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function AdminDashboard() {
  const { data: stats, isLoading, isError } = useAdminStats();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-display font-bold">Dashboard</h1>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white/5 border border-white/10 rounded-2xl h-32 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 border border-red-500/30 bg-red-500/10 rounded-2xl flex items-center gap-3">
        <AlertCircle className="text-red-500 w-6 h-6" />
        <span className="text-red-200">Failed to load admin stats.</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-display font-bold">Dashboard Overview</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Total Users" value={stats?.totalUsers || 0} icon={Users} color="text-blue-400" />
        <StatCard title="Total Plans" value={stats?.totalWorkoutPlans + stats?.totalDietPlans || 0} icon={Dumbbell} color="text-[#FFD700]" />
        <StatCard title="Plans Today" value={stats?.plansToday || 0} icon={TrendingUp} color="text-green-400" />
        <StatCard title="Plans This Week" value={stats?.plansThisWeek || 0} icon={Calendar} color="text-[#FFD700]" />
        
        <StatCard 
          title="Contact Leads" 
          value={stats?.contactLeads || 0} 
          subLabel={stats?.unreadLeads ? `${stats.unreadLeads} unread` : "All read"} 
          icon={Mail} 
          color="text-orange-400" 
        />
        <StatCard title="Newsletter Subs" value={stats?.newsletterSubscribers || 0} icon={Send} color="text-purple-400" />
        <StatCard title="Published Blogs" value={stats?.publishedBlogs || 0} icon={FileText} color="text-gray-300" />
        <StatCard title="Total Templates" value={(stats?.totalWorkoutTemplates || 0) + (stats?.totalDietTemplates || 0)} icon={Layers} color="text-teal-400" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h2 className="font-display font-bold text-lg mb-4">Recent Activity</h2>
          <div className="text-gray-400 py-8 text-center italic">
            System ready. No activity log yet.
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h2 className="font-display font-bold text-lg mb-4">Quick Actions</h2>
          <div className="flex flex-col gap-3">
            <Link href="/admin/blogs" className="bg-[#FFD700]/10 text-[#FFD700] hover:bg-[#FFD700]/20 px-4 py-3 rounded-xl transition-colors font-medium text-center">
              Write New Blog Post
            </Link>
            <Link href="/admin/newsletter" className="bg-white/5 text-white hover:bg-white/10 border border-white/10 px-4 py-3 rounded-xl transition-colors font-medium text-center">
              Export Newsletter CSV
            </Link>
            <Link href="/admin/leads" className="bg-white/5 text-white hover:bg-white/10 border border-white/10 px-4 py-3 rounded-xl transition-colors font-medium text-center">
              View Contact Leads
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, subLabel, icon: Icon, color }: any) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-5 relative overflow-hidden">
      <div className="flex justify-between items-start mb-2">
        <div>
          <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">{title}</span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-3xl font-display font-bold">{value}</span>
            {subLabel && <span className="text-xs text-[#FFD700]">{subLabel}</span>}
          </div>
        </div>
        <div className={`p-2 rounded-xl bg-white/5 ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <Sparkline />
    </div>
  );
}
