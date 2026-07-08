"use client";

import { useAppStore } from "@/store/useAppStore";
import { Theme, useTheme } from "@/components/providers/ThemeProvider";
import { useToast } from "@/components/ui/Toast";
import { useState } from "react";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  
  const [autoSave, setAutoSave] = useState(true);

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

      </div>

    </div>
  );
}
