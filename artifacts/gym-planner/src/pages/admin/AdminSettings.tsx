import { useState, useEffect } from "react";
import { useAdminSettings, useUpdateSettings } from "@/lib/admin-api";
import { Save, ShieldAlert, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function AdminSettings() {
  const { data: settings = {}, isLoading } = useAdminSettings();
  const updateSettings = useUpdateSettings();
  const { toast } = useToast();

  const [form, setForm] = useState({
    maintenance_mode: "false",
    ai_prompt_prefix: "",
    contact_email: "",
    site_title: "Tarik Islam AI Gym Planner"
  });

  useEffect(() => {
    if (!isLoading && Object.keys(settings).length > 0) {
      setForm({
        maintenance_mode: settings.maintenance_mode || "false",
        ai_prompt_prefix: settings.ai_prompt_prefix || "",
        contact_email: settings.contact_email || "",
        site_title: settings.site_title || "Tarik Islam AI Gym Planner"
      });
    }
  }, [settings, isLoading]);

  const handleSave = () => {
    updateSettings.mutate(form, {
      onSuccess: () => {
        toast({ title: "Settings Saved", description: "Global configuration updated successfully." });
      }
    });
  };

  if (isLoading) {
    return <div className="animate-pulse">Loading settings...</div>;
  }

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-display font-bold">System Settings</h1>
        <p className="text-gray-400 text-sm mt-1">Configure global platform behavior</p>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-8 space-y-8">
        
        {/* Toggle block */}
        <div className="flex items-center justify-between border-b border-white/10 pb-8">
          <div className="space-y-1 pr-4">
            <h3 className="font-display font-bold flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-orange-400" /> Maintenance Mode
            </h3>
            <p className="text-sm text-gray-400">When enabled, the public site shows a maintenance banner and AI generation is paused.</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer shrink-0">
            <input 
              type="checkbox" 
              className="sr-only peer" 
              checked={form.maintenance_mode === "true"}
              onChange={e => setForm({ ...form, maintenance_mode: e.target.checked ? "true" : "false" })}
            />
            <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
          </label>
        </div>

        {/* Inputs */}
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-400 uppercase">Site Title Override</label>
            <input 
              type="text" 
              value={form.site_title}
              onChange={e => setForm({ ...form, site_title: e.target.value })}
              className="w-full bg-[#1A1A1A] border border-white/10 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#FFD700]"
            />
            <p className="text-xs text-gray-500">Appears in the browser tab and email subjects.</p>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-400 uppercase">Contact Email</label>
            <input 
              type="email" 
              value={form.contact_email}
              onChange={e => setForm({ ...form, contact_email: e.target.value })}
              className="w-full bg-[#1A1A1A] border border-white/10 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#FFD700]"
              placeholder="admin@example.com"
            />
            <p className="text-xs text-gray-500">Where form submissions are sent.</p>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-400 uppercase">AI Prompt Prefix</label>
            <textarea 
              value={form.ai_prompt_prefix}
              onChange={e => setForm({ ...form, ai_prompt_prefix: e.target.value })}
              className="w-full min-h-[120px] bg-[#1A1A1A] border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#FFD700] resize-none"
              placeholder="You are Tarik Islam's AI coach. Tone: Direct, encouraging, authoritative."
            />
            <p className="text-xs text-gray-500">Prepended to all Gemini system prompts to control the coach's personality.</p>
          </div>
        </div>

        <div className="pt-4 border-t border-white/10">
          <Button onClick={handleSave} className="bg-[#FFD700] hover:bg-yellow-500 text-black font-bold gap-2 px-8">
            <Save className="w-4 h-4" /> Save Settings
          </Button>
        </div>
      </div>
    </div>
  );
}
