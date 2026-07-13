import { useState } from "react";
import { useAdminUsers, useUpdateUser } from "@/lib/admin-api";
import { Search, Shield, ShieldOff, UserX, UserCheck, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminUsers() {
  const [searchTerm, setSearchTerm] = useState("");
  const { data, isLoading, isError } = useAdminUsers(1, 50);
  const updateUser = useUpdateUser();

  const handleToggleSuspend = (id: string, isSuspended: boolean) => {
    updateUser.mutate({ id, data: { isSuspended: !isSuspended } });
  };

  const handleToggleAdmin = (id: string, isAdmin: boolean) => {
    updateUser.mutate({ id, data: { isAdmin: !isAdmin } });
  };

  const users = data?.users || [];
  const filteredUsers = users.filter((u: any) => 
    (u.fullName?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
    (u.email?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
    u.id.includes(searchTerm)
  );

  return (
    <div className="space-y-6 flex flex-col h-full">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-display font-bold">Users</h1>
          <p className="text-gray-400 text-sm mt-1">Manage platform members ({data?.total || 0} total)</p>
        </div>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search users..." 
            className="bg-[#1A1A1A] border border-white/10 text-white rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-[#FFD700] w-64"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {isError && (
        <div className="p-4 border border-red-500/30 bg-red-500/10 rounded-xl flex items-center gap-3">
          <AlertCircle className="text-red-500 w-5 h-5" />
          <span className="text-red-200">Failed to load users.</span>
        </div>
      )}

      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden flex-1 flex flex-col min-h-[500px]">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#FFD700]/30 bg-white/5 text-xs uppercase tracking-wider text-gray-400">
                <th className="p-4 font-medium">Name</th>
                <th className="p-4 font-medium">Goal</th>
                <th className="p-4 font-medium">Experience</th>
                <th className="p-4 font-medium">Joined</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="bg-white/3">
                    <td className="p-4"><div className="h-4 bg-white/10 rounded animate-pulse w-32"></div></td>
                    <td className="p-4"><div className="h-4 bg-white/10 rounded animate-pulse w-24"></div></td>
                    <td className="p-4"><div className="h-4 bg-white/10 rounded animate-pulse w-24"></div></td>
                    <td className="p-4"><div className="h-4 bg-white/10 rounded animate-pulse w-24"></div></td>
                    <td className="p-4"></td>
                  </tr>
                ))
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">No users found.</td>
                </tr>
              ) : (
                filteredUsers.map((user: any) => (
                  <tr key={user.id} className="bg-white/3 hover:bg-white/7 transition-colors">
                    <td className="p-4">
                      <div className="flex flex-col gap-1">
                        <span className="font-medium text-white flex items-center gap-2">
                          {user.fullName || "Unnamed User"}
                          {user.isAdmin && <span className="bg-[#FFD700]/20 text-[#FFD700] text-[10px] px-1.5 py-0.5 rounded font-bold uppercase">Admin</span>}
                          {user.isSuspended && <span className="bg-red-500/20 text-red-400 text-[10px] px-1.5 py-0.5 rounded font-bold uppercase">Suspended</span>}
                        </span>
                        <span className="text-xs text-gray-500">{user.id.slice(0, 12)}...</span>
                      </div>
                    </td>
                    <td className="p-4 text-gray-300">{user.goal || "-"}</td>
                    <td className="p-4 text-gray-300">{user.workoutExperience || "-"}</td>
                    <td className="p-4 text-gray-300">{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleToggleAdmin(user.id, user.isAdmin)}
                          className="p-1.5 rounded-md hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                          title={user.isAdmin ? "Remove Admin" : "Make Admin"}
                        >
                          {user.isAdmin ? <ShieldOff className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => handleToggleSuspend(user.id, user.isSuspended)}
                          className={`p-1.5 rounded-md transition-colors ${user.isSuspended ? "hover:bg-green-500/20 text-green-400" : "hover:bg-red-500/20 text-red-400"}`}
                          title={user.isSuspended ? "Unsuspend User" : "Suspend User"}
                        >
                          {user.isSuspended ? <UserCheck className="w-4 h-4" /> : <UserX className="w-4 h-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
