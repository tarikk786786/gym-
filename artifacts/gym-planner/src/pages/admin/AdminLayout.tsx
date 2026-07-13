import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useGetProfile } from "@workspace/api-client-react";
import { BarChart3, Users, Mail, Send, Layers, FileText, Settings, ArrowLeft } from "lucide-react";

export function AdminLayout({ children }: { children: ReactNode }) {
  const [location, setLocation] = useLocation();
  const { data: profile, isLoading } = useGetProfile();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[#FFD700] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!profile?.isAdmin) {
    setTimeout(() => setLocation('/dashboard'), 0);
    return null;
  }

  const navItems = [
    { href: "/admin", icon: BarChart3, label: "Dashboard", exact: true },
    { href: "/admin/users", icon: Users, label: "Users" },
    { href: "/admin/leads", icon: Mail, label: "Leads" },
    { href: "/admin/newsletter", icon: Send, label: "Newsletter" },
    { href: "/admin/templates", icon: Layers, label: "Templates" },
    { href: "/admin/blogs", icon: FileText, label: "Blog" },
    { href: "/admin/settings", icon: Settings, label: "Settings" },
  ];

  return (
    <div className="min-h-[100dvh] bg-[#050505] text-white flex text-sm">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 bottom-0 w-[240px] bg-[#0a0a0a] border-r border-white/5 flex flex-col z-20">
        <div className="p-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="font-display font-bold text-lg text-[#FFD700]">Tarik AI</span>
            <span className="text-xs bg-white/10 px-2 py-0.5 rounded text-gray-300">ADMIN</span>
          </Link>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = item.exact ? location === item.href : location.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href} className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive ? 'bg-[#FFD700]/10 text-[#FFD700] border-l-2 border-[#FFD700] pl-2.5' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
                <Icon className="w-4 h-4" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/5">
          <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/5">
            <ArrowLeft className="w-4 h-4" />
            <span className="font-medium">Back to App</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-[240px] flex-1 flex flex-col min-w-0">
        <div className="p-8 flex-1">
          {children}
        </div>
      </main>
    </div>
  );
}
