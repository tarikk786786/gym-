import { useState, Fragment } from "react";
import { useAdminLeads, useUpdateLead } from "@/lib/admin-api";
import { Eye, CheckCircle2, ChevronDown, ChevronUp, AlertCircle } from "lucide-react";

export default function AdminLeads() {
  const { data, isLoading, isError } = useAdminLeads();
  const updateLead = useUpdateLead();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleMarkRead = (id: string) => {
    updateLead.mutate(id);
  };

  const leads = data?.leads || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Contact Leads</h1>
        <p className="text-gray-400 text-sm mt-1">Form submissions from the public website</p>
      </div>

      {isError && (
        <div className="p-4 border border-red-500/30 bg-red-500/10 rounded-xl flex items-center gap-3">
          <AlertCircle className="text-red-500 w-5 h-5" />
          <span className="text-red-200">Failed to load leads.</span>
        </div>
      )}

      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#FFD700]/30 bg-white/5 text-xs uppercase tracking-wider text-gray-400">
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Date</th>
                <th className="p-4 font-medium">Name</th>
                <th className="p-4 font-medium">Email</th>
                <th className="p-4 font-medium">Subject</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">Loading...</td>
                </tr>
              ) : leads.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">No leads found.</td>
                </tr>
              ) : (
                leads.map((lead: any) => {
                  const isExpanded = expandedId === lead.id;
                  return (
                    <Fragment key={lead.id}>
                      <tr 
                        className={`bg-white/3 hover:bg-white/7 transition-colors cursor-pointer ${!lead.isRead ? 'border-l-2 border-l-[#FFD700]' : ''}`}
                        onClick={() => setExpandedId(isExpanded ? null : lead.id)}
                      >
                        <td className="p-4">
                          {!lead.isRead ? (
                            <span className="w-2 h-2 rounded-full bg-[#FFD700] inline-block shadow-[0_0_8px_#FFD700]"></span>
                          ) : (
                            <span className="w-2 h-2 rounded-full bg-gray-600 inline-block"></span>
                          )}
                        </td>
                        <td className="p-4 text-gray-300">{new Date(lead.createdAt).toLocaleDateString()}</td>
                        <td className="p-4 font-medium text-white">{lead.name}</td>
                        <td className="p-4 text-gray-400">{lead.email}</td>
                        <td className="p-4 text-gray-300 max-w-[200px] truncate">{lead.subject || "No Subject"}</td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-3" onClick={(e) => e.stopPropagation()}>
                            {!lead.isRead && (
                              <button 
                                onClick={() => handleMarkRead(lead.id)}
                                className="text-xs flex items-center gap-1 text-[#FFD700] hover:text-yellow-400 transition-colors"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" /> Mark Read
                              </button>
                            )}
                            <button className="text-gray-400 hover:text-white transition-colors p-1">
                              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </button>
                          </div>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr className="bg-black/20 border-b border-white/5">
                          <td colSpan={6} className="p-6">
                            <div className="bg-white/5 border border-white/10 rounded-xl p-5 text-gray-300 whitespace-pre-wrap font-sans text-sm">
                              {lead.message}
                            </div>
                            <div className="mt-4 flex gap-3">
                              <a href={`mailto:${lead.email}`} className="bg-[#FFD700] text-black hover:bg-yellow-500 px-4 py-2 rounded-lg font-medium text-sm transition-colors">
                                Reply via Email
                              </a>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
