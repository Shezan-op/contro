"use client";

import { useAppStore } from "@/store/useAppStore";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LogOut, User as UserIcon, BarChart3, Edit2, Check, X } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { createClient } from "@/lib/supabase/client";

export default function ProfilePage() {
  const { drafts, projects, tasks, leadMagnets } = useAppStore();
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();
  
  const [name, setName] = useState("User");
  const [email, setEmail] = useState("");
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState("");
  const [isConfirmingLogout, setIsConfirmingLogout] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setEmail(user.email || "");
        setName(user.user_metadata?.name || user.email?.split("@")[0] || "User");
      }
    });
  }, [supabase]);

  const handleSaveName = async () => {
    if (tempName.trim()) {
      setName(tempName.trim());
      await supabase.auth.updateUser({
        data: { name: tempName.trim() }
      });
      toast("Name updated successfully", "success");
    }
    setIsEditingName(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast("Logged out successfully", "success");
    router.push("/login");
    router.refresh();
  };

  const totalContent = drafts.length + projects.length + tasks.length + leadMagnets.length;

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-12 animate-fade-in">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Profile</h1>
          <p className="text-[var(--muted)] mt-1">Manage your personal information and preferences.</p>
        </div>
        <button type="button" 
          onClick={() => setIsConfirmingLogout(true)}
          className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-500 border border-red-500/20 text-sm font-medium rounded-lg hover:bg-red-500/20 transition whitespace-nowrap active:scale-95 shadow-sm"
        >
          <LogOut size={16} />
          Logout
        </button>
      </header>
      
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-8 flex flex-col items-center justify-center text-center space-y-4 shadow-sm relative">
        <div className="w-24 h-24 bg-[var(--background)] border-2 border-[var(--border)] rounded-full flex items-center justify-center overflow-hidden shadow-sm">
          <UserIcon size={40} className="text-[var(--muted)]" />
        </div>
        
        <div className="flex flex-col items-center">
          {isEditingName ? (
            <div className="flex items-center gap-2">
              <input 
                aria-label="Profile name"
                type="text" 
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                className="text-xl font-medium bg-[var(--background)] border border-[var(--border)] rounded-md px-3 py-1 outline-none focus:border-[var(--text)]"
              />
              <button type="button" onClick={handleSaveName} className="p-1.5 bg-[var(--text)] text-[var(--background)] rounded-md hover:opacity-90" aria-label="Save name">
                <Check size={16} />
              </button>
              <button type="button" onClick={() => setIsEditingName(false)} className="p-1.5 bg-[var(--background)] text-[var(--muted)] border border-[var(--border)] rounded-md hover:text-[var(--text)]" aria-label="Cancel name edit">
                <X size={16} />
              </button>
            </div>
          ) : (
            <button type="button" className="flex items-center gap-2 group" onClick={() => { setTempName(name); setIsEditingName(true); }}>
              <h2 className="text-2xl font-medium">{name}</h2>
              <Edit2 size={14} className="text-[var(--muted)] opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          )}
          <p className="text-[var(--muted)] mt-1">{email}</p>
        </div>
      </div>
      
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-6 border-b border-[var(--border)] pb-4">
          <BarChart3 size={20} className="text-[var(--muted)]" />
          <h3 className="text-lg font-semibold tracking-tight">Workspace Stats</h3>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-[var(--background)] p-4 rounded-xl border border-[var(--border)] text-center shadow-sm">
            <div className="text-3xl font-semibold mb-1">{totalContent}</div>
            <div className="text-xs font-medium text-[var(--muted)] uppercase tracking-wider">Total Items</div>
          </div>
          <div className="bg-[var(--background)] p-4 rounded-xl border border-[var(--border)] text-center shadow-sm">
            <div className="text-3xl font-semibold mb-1">{drafts.length}</div>
            <div className="text-xs font-medium text-[var(--muted)] uppercase tracking-wider">Drafts</div>
          </div>
          <div className="bg-[var(--background)] p-4 rounded-xl border border-[var(--border)] text-center shadow-sm">
            <div className="text-3xl font-semibold mb-1">{projects.length}</div>
            <div className="text-xs font-medium text-[var(--muted)] uppercase tracking-wider">Projects</div>
          </div>
          <div className="bg-[var(--background)] p-4 rounded-xl border border-[var(--border)] text-center shadow-sm">
            <div className="text-3xl font-semibold mb-1">{tasks.length}</div>
            <div className="text-xs font-medium text-[var(--muted)] uppercase tracking-wider">Tasks</div>
          </div>
        </div>
      </div>

      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 shadow-sm relative overflow-hidden group">
        <div className="absolute inset-0 bg-[var(--background)]/80 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="bg-[var(--surface)] border border-[var(--border)] px-4 py-2 rounded-full font-medium shadow-sm">
            Coming Soon
          </div>
        </div>
        <div className="flex items-center gap-2 mb-6 border-b border-[var(--border)] pb-4">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--muted)]"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
          <h3 className="text-lg font-semibold tracking-tight">Connected Accounts</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 opacity-50 grayscale pointer-events-none">
          <div className="flex items-center justify-between bg-[var(--background)] p-4 rounded-xl border border-[var(--border)]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#0A66C2] rounded-lg flex items-center justify-center text-white">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              </div>
              <div>
                <div className="font-medium">LinkedIn</div>
                <div className="text-xs text-[var(--muted)]">Connect your profile or company page</div>
              </div>
            </div>
            <button type="button" className="px-3 py-1.5 bg-[var(--surface)] border border-[var(--border)] rounded-md text-sm font-medium">Connect</button>
          </div>
          <div className="flex items-center justify-between bg-[var(--background)] p-4 rounded-xl border border-[var(--border)]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center text-white">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </div>
              <div>
                <div className="font-medium">X (Twitter)</div>
                <div className="text-xs text-[var(--muted)]">Connect your account</div>
              </div>
            </div>
            <button type="button" className="px-3 py-1.5 bg-[var(--surface)] border border-[var(--border)] rounded-md text-sm font-medium">Connect</button>
          </div>
        </div>
      </div>
      <ConfirmDialog
        isOpen={isConfirmingLogout}
        title="Logout"
        message="Are you sure you want to log out?"
        confirmLabel="Logout"
        isDestructive
        onConfirm={handleLogout}
        onCancel={() => setIsConfirmingLogout(false)}
      />
    </div>
  );
}
