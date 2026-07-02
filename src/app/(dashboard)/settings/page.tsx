"use client";

import { useAppStore } from "@/store/useAppStore";
import { Theme, useTheme } from "@/components/providers/ThemeProvider";
import { db } from "@/lib/db";
import { useToast } from "@/components/ui/Toast";
import { useState, useEffect } from "react";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

export default function SettingsPage() {
  const { isOffline, setOfflineStatus } = useAppStore();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  
  const [autoSave, setAutoSave] = useState(true);
  const [storageUsed, setStorageUsed] = useState("Calculating...");
  const [isConfirmingClear, setIsConfirmingClear] = useState(false);

  useEffect(() => {
    // Estimate storage used by IndexedDB (approximate)
    if (navigator.storage && navigator.storage.estimate) {
      navigator.storage.estimate().then(estimate => {
        if (estimate.usage) {
          const mb = (estimate.usage / (1024 * 1024)).toFixed(2);
          setStorageUsed(`${mb} MB used by local database`);
        } else {
          setStorageUsed("Storage usage unavailable");
        }
      }).catch(() => {
        setStorageUsed("Storage usage unavailable");
      });
    }
  }, []);

  const handleClearData = async () => {
    try {
      await db.delete();
      toast("Local data cleared successfully. Reloading...", "success");
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch {
      toast("Failed to clear local data.", "error");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-12 animate-fade-in">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">Settings</h1>
        <p className="text-[var(--muted)] mt-1">Configure your workspace and application preferences.</p>
      </header>
      
      <div className="space-y-6">
        <section className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6">
          <h2 className="text-lg font-semibold mb-4 border-b border-[var(--border)] pb-2">Appearance & Behavior</h2>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Theme</h3>
                <p className="text-sm text-[var(--muted)]">Select your preferred interface theme.</p>
              </div>
              <select 
                value={theme}
                onChange={(e) => setTheme(e.target.value as Theme)}
                className="p-2 bg-[var(--background)] border border-[var(--border)] rounded-md text-sm text-[var(--text)] focus:outline-none"
              >
                <option value="system">System</option>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Auto-Save</h3>
                <p className="text-sm text-[var(--muted)]">Automatically save content while writing.</p>
              </div>
              <button type="button" 
                onClick={() => setAutoSave(!autoSave)}
                className={`w-12 h-6 rounded-full transition-colors relative ${autoSave ? 'bg-[var(--text)]' : 'bg-[var(--border)]'}`}
                aria-label="Toggle auto-save"
              >
                <div className={`w-4 h-4 rounded-full bg-[var(--background)] absolute top-1 transition-transform ${autoSave ? 'left-7' : 'left-1'}`} />
              </button>
            </div>
          </div>
        </section>

        <section className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6">
          <h2 className="text-lg font-semibold mb-4 border-b border-[var(--border)] pb-2">Keyboard Shortcuts</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-3 bg-[var(--background)] border border-[var(--border)] rounded-lg">
              <span className="text-sm font-medium">New Draft</span>
              <kbd className="px-2 py-1 bg-[var(--surface)] border border-[var(--border)] rounded text-xs font-mono text-[var(--muted)]">Ctrl/Cmd + N</kbd>
            </div>
            <div className="flex items-center justify-between p-3 bg-[var(--background)] border border-[var(--border)] rounded-lg">
              <span className="text-sm font-medium">Save Content</span>
              <kbd className="px-2 py-1 bg-[var(--surface)] border border-[var(--border)] rounded text-xs font-mono text-[var(--muted)]">Ctrl/Cmd + S</kbd>
            </div>
            <div className="flex items-center justify-between p-3 bg-[var(--background)] border border-[var(--border)] rounded-lg">
              <span className="text-sm font-medium">Global Search</span>
              <kbd className="px-2 py-1 bg-[var(--surface)] border border-[var(--border)] rounded text-xs font-mono text-[var(--muted)]">Ctrl/Cmd + K</kbd>
            </div>
            <div className="flex items-center justify-between p-3 bg-[var(--background)] border border-[var(--border)] rounded-lg">
              <span className="text-sm font-medium">Format Bold</span>
              <kbd className="px-2 py-1 bg-[var(--surface)] border border-[var(--border)] rounded text-xs font-mono text-[var(--muted)]">Ctrl/Cmd + B</kbd>
            </div>
          </div>
        </section>

        <section className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6">
          <h2 className="text-lg font-semibold mb-4 border-b border-[var(--border)] pb-2">Sync & Storage</h2>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Force Offline Mode</h3>
                <p className="text-sm text-[var(--muted)]">Work completely offline. Changes will sync when disabled.</p>
              </div>
              <button type="button" 
                onClick={() => setOfflineStatus(!isOffline)}
                className={`w-12 h-6 rounded-full transition-colors relative ${isOffline ? 'bg-[var(--text)]' : 'bg-[var(--border)]'}`}
                aria-label="Toggle offline mode"
              >
                <div className={`w-4 h-4 rounded-full bg-[var(--background)] absolute top-1 transition-transform ${isOffline ? 'left-7' : 'left-1'}`} />
              </button>
            </div>
            
            <div className="flex items-center justify-between pt-4 border-t border-[var(--border)] border-dashed">
              <div>
                <h3 className="font-medium">Local Storage Usage</h3>
                <p className="text-sm text-[var(--muted)]">{storageUsed}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6">
          <h2 className="text-lg font-semibold mb-4 border-b border-[var(--border)] pb-2 text-red-500">Danger Zone</h2>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-red-500/5 border border-red-500/20 rounded-xl">
              <div>
                <h3 className="font-medium text-red-500">Clear Local Data</h3>
                <p className="text-sm text-red-500/80">Permanently delete all locally stored data. This cannot be undone.</p>
              </div>
              <button type="button" 
                onClick={() => setIsConfirmingClear(true)}
                className="px-4 py-2 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 transition whitespace-nowrap shadow-sm active:scale-95"
              >
                Clear Local Data
              </button>
            </div>
          </div>
        </section>
      </div>

      <ConfirmDialog
        isOpen={isConfirmingClear}
        title="Clear all local data?"
        message="This action will permanently delete all local projects, drafts, tasks, and settings. It cannot be undone."
        confirmLabel="Yes, Clear Data"
        isDestructive
        onConfirm={handleClearData}
        onCancel={() => setIsConfirmingClear(false)}
      />
    </div>
  );
}
