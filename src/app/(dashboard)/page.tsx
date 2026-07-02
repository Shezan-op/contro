"use client";

import { useAppStore } from "@/store/useAppStore";
import { Plus, Calendar as CalendarIcon, Pin, Clock, CheckSquare } from "lucide-react";

export default function DashboardPage() {
  const { projects, tasks, items } = useAppStore();
  
  // Derived state (mock for now, will map to actual state later)
  const topTasks = tasks.filter(t => !t.isCompleted).slice(0, 3);
  const pinnedProjects = projects.filter(p => p.isStarred).slice(0, 3);
  const recentItems = items.slice(0, 5);

  return (
    <div className="max-w-6xl mx-auto p-8 space-y-12">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Good morning.</h1>
          <p className="text-[var(--muted)] mt-1">Here is what&apos;s happening in your workspace.</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-[var(--text)] text-[var(--background)] px-4 py-2 rounded-lg font-medium hover:opacity-90 transition">
            <Plus size={18} />
            New Draft
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Calendar Section (Mock UI) */}
          <section className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <CalendarIcon size={18} className="text-[var(--muted)]" />
                This Week
              </h2>
              <button className="text-sm font-medium text-[var(--muted)] hover:text-[var(--text)] transition">
                View Month
              </button>
            </div>
            <div className="grid grid-cols-7 gap-2">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                <div key={day} className="flex flex-col items-center justify-center p-3 rounded-lg border border-[var(--border)] bg-[var(--background)]">
                  <span className="text-xs text-[var(--muted)]">{day}</span>
                  <span className="text-lg font-medium mt-1">--</span>
                </div>
              ))}
            </div>
          </section>

          {/* Recent Items */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Clock size={18} className="text-[var(--muted)]" />
                Recent Activity
              </h2>
              <button className="text-sm font-medium text-[var(--muted)] hover:text-[var(--text)] transition">
                View All
              </button>
            </div>
            {recentItems.length === 0 ? (
              <div className="p-8 border border-[var(--border)] border-dashed rounded-2xl text-center">
                <p className="text-[var(--muted)]">No recent activity.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentItems.map(item => (
                  <div key={item.id} className="flex items-center justify-between p-4 bg-[var(--surface)] border border-[var(--border)] rounded-xl hover:border-[var(--text)] transition cursor-pointer">
                    <span className="font-medium">{item.title}</span>
                    <span className="text-xs text-[var(--muted)]">{item.type}</span>
                  </div>
                ))}
              </div>
            )}
          </section>

        </div>

        {/* Right Sidebar Area */}
        <div className="space-y-8">
          
          {/* Top Tasks */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <CheckSquare size={18} className="text-[var(--muted)]" />
                Top Tasks
              </h2>
              <button className="text-sm font-medium text-[var(--muted)] hover:text-[var(--text)] transition">
                View All
              </button>
            </div>
            {topTasks.length === 0 ? (
              <div className="p-6 border border-[var(--border)] border-dashed rounded-2xl text-center">
                <p className="text-[var(--muted)] text-sm">All caught up.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {topTasks.map(task => (
                  <div key={task.id} className="flex items-start gap-3 p-4 bg-[var(--surface)] border border-[var(--border)] rounded-xl">
                    <div className="w-5 h-5 rounded border border-[var(--border)] mt-0.5 flex-shrink-0" />
                    <span className="text-sm font-medium leading-snug">{task.title}</span>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Pinned Projects */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Pin size={18} className="text-[var(--muted)]" />
                Pinned Projects
              </h2>
            </div>
            {pinnedProjects.length === 0 ? (
              <div className="p-6 border border-[var(--border)] border-dashed rounded-2xl text-center">
                <p className="text-[var(--muted)] text-sm">No pinned projects.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pinnedProjects.map(project => (
                  <div key={project.id} className="p-4 bg-[var(--surface)] border border-[var(--border)] rounded-xl hover:border-[var(--text)] transition cursor-pointer">
                    <h3 className="font-medium">{project.title}</h3>
                  </div>
                ))}
              </div>
            )}
          </section>

        </div>
      </div>
    </div>
  );
}
