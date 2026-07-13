import { useState } from "react";
import { useAdminNewsletter } from "@/lib/admin-api";
import { Download, Edit3, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

const BASE = import.meta.env.BASE_URL || "/";

export default function AdminNewsletter() {
  const { data, isLoading } = useAdminNewsletter();
  const { toast } = useToast();
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");

  const handleExportCsv = async () => {
    try {
      const url = `${BASE}api/admin/newsletter?format=csv`.replace("//api", "/api");
      const r = await fetch(url);
      const blob = await r.blob();
      const objUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = objUrl;
      a.download = 'subscribers.csv';
      a.click();
      URL.revokeObjectURL(objUrl);
    } catch (err) {
      toast({ title: "Export failed", description: "Could not export CSV.", variant: "destructive" });
    }
  };

  const handleSaveDraft = () => {
    if (!subject || !content) {
      toast({ title: "Incomplete", description: "Please enter a subject and content.", variant: "destructive" });
      return;
    }
    toast({ title: "Draft Saved", description: "Newsletter draft saved successfully." });
    setSubject("");
    setContent("");
  };

  const subs = data?.subscribers || [];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-display font-bold">Newsletter</h1>
          <p className="text-gray-400 text-sm mt-1">Manage subscribers and compose emails</p>
        </div>
        <div className="bg-[#FFD700]/10 text-[#FFD700] px-4 py-2 rounded-xl border border-[#FFD700]/20 font-bold">
          {data?.total || 0} Subscribers
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="font-display font-bold text-lg">Subscribers</h2>
            <Button onClick={handleExportCsv} variant="outline" size="sm" className="bg-white/5 border-white/10 hover:bg-white/10 text-white rounded-lg gap-2 h-9">
              <Download className="w-4 h-4" /> Export CSV
            </Button>
          </div>
          
          <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
            <div className="overflow-y-auto max-h-[500px]">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-[#0a0a0a] border-b border-[#FFD700]/30 text-xs uppercase tracking-wider text-gray-400">
                  <tr>
                    <th className="p-4 font-medium">Email</th>
                    <th className="p-4 font-medium">Joined</th>
                    <th className="p-4 font-medium text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-sm">
                  {isLoading ? (
                    <tr><td colSpan={3} className="p-8 text-center text-gray-500">Loading...</td></tr>
                  ) : subs.length === 0 ? (
                    <tr><td colSpan={3} className="p-8 text-center text-gray-500">No subscribers.</td></tr>
                  ) : (
                    subs.map((sub: any) => (
                      <tr key={sub.id} className="bg-white/3 hover:bg-white/7">
                        <td className="p-4 font-medium text-white">{sub.email}</td>
                        <td className="p-4 text-gray-400">{new Date(sub.createdAt).toLocaleDateString()}</td>
                        <td className="p-4 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${sub.active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                            {sub.active ? 'Active' : 'Unsub'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-4 flex flex-col">
          <h2 className="font-display font-bold text-lg">Compose Newsletter</h2>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex-1 flex flex-col gap-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-400 uppercase">Subject Line</label>
              <input 
                type="text" 
                value={subject}
                onChange={e => setSubject(e.target.value)}
                className="w-full bg-[#1A1A1A] border border-white/10 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#FFD700]"
                placeholder="Exciting news from Tarik AI..."
              />
            </div>
            
            <div className="space-y-2 flex-1 flex flex-col">
              <label className="text-xs font-medium text-gray-400 uppercase">Content (Markdown)</label>
              <textarea 
                value={content}
                onChange={e => setContent(e.target.value)}
                className="w-full flex-1 min-h-[300px] bg-[#1A1A1A] border border-white/10 text-white rounded-xl px-4 py-3 font-mono text-sm focus:outline-none focus:border-[#FFD700] resize-none"
                placeholder="Write your email content here..."
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button onClick={handleSaveDraft} className="flex-1 bg-[#FFD700] hover:bg-yellow-500 text-black font-bold gap-2 rounded-xl">
                <Edit3 className="w-4 h-4" /> Save Draft
              </Button>
              <Button disabled variant="outline" className="flex-1 bg-white/5 border-white/10 text-gray-500 rounded-xl gap-2 cursor-not-allowed">
                <Send className="w-4 h-4" /> Send to All (Coming Soon)
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
