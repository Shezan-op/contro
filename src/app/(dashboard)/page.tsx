"use client";

import { useMemo } from "react";
import { useAppStore } from "@/store/useAppStore";
import { Plus, Calendar as CalendarIcon, Pin, CheckSquare, LibraryBig, Check, PenLine } from "lucide-react";
import Link from "next/link";
import { eachDayOfInterval, startOfWeek, endOfWeek, isSameDay, isToday, format } from "date-fns";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { TaskService } from "@/services/TaskService";

export default function DashboardPage() {
  const { projects, tasks, drafts, isLoading, workspaceId, refreshData } = useAppStore();
  
  const topTasks = tasks.filter(t => !t.isCompleted).slice(0, 5);
  const pinnedProjects = projects.filter(p => p.isStarred).slice(0, 3);
  
  // All content items with a scheduled date
  const scheduledItems = [...projects, ...drafts, ...tasks].filter(item => item.scheduledFor);
  const weekDays = useMemo(() => {
    const today = new Date();
    return eachDayOfInterval({
      start: startOfWeek(today, { weekStartsOn: 1 }),
      end: endOfWeek(today, { weekStartsOn: 1 })
    });
  }, []);

  const handleTaskToggle = async (taskId: string, currentStatus: boolean) => {
    if (!workspaceId) return;
    await TaskService.toggleCompletion(taskId, !currentStatus);
    await refreshData();
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto p-8 space-y-12">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <LoadingSkeleton variant="text" className="h-10 w-48 mb-2" />
            <LoadingSkeleton variant="text" className="h-5 w-64" />
          </div>
        </header>
        <LoadingSkeleton variant="page" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8 md:space-y-12 animate-fade-in">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Welcome back.</h1>
          <p className="text-[var(--muted)] mt-1">Here is what&apos;s happening in your workspace.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <Link 
            href="/writer?new=true"
            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-[var(--text)] text-[var(--background)] px-4 py-2 rounded-lg font-medium hover:opacity-90 transition active:scale-95"
          >
            <Plus size={18} />
            New Draft
          </Link>
        </div>
      </header>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link href="/writer?new=true" className="flex flex-col items-center justify-center p-6 bg-[var(--surface)] border border-[var(--border)] rounded-2xl hover:border-[var(--text)] hover:shadow-sm transition group active:scale-[0.98]">
          <div className="w-12 h-12 rounded-full bg-[var(--background)] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <PenLine size={24} className="text-[var(--text)]" />
          </div>
          <span className="font-medium">Write</span>
        </Link>
        <Link href="/calendar" className="flex flex-col items-center justify-center p-6 bg-[var(--surface)] border border-[var(--border)] rounded-2xl hover:border-[var(--text)] hover:shadow-sm transition group active:scale-[0.98]">
          <div className="w-12 h-12 rounded-full bg-[var(--background)] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <CalendarIcon size={24} className="text-[var(--text)]" />
          </div>
          <span className="font-medium">Calendar</span>
        </Link>
        <Link href="/inventory" className="flex flex-col items-center justify-center p-6 bg-[var(--surface)] border border-[var(--border)] rounded-2xl hover:border-[var(--text)] hover:shadow-sm transition group active:scale-[0.98]">
          <div className="w-12 h-12 rounded-full bg-[var(--background)] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <LibraryBig size={24} className="text-[var(--text)]" />
          </div>
          <span className="font-medium">Inventory</span>
        </Link>
        <Link href="/tasks" className="flex flex-col items-center justify-center p-6 bg-[var(--surface)] border border-[var(--border)] rounded-2xl hover:border-[var(--text)] hover:shadow-sm transition group active:scale-[0.98]">
          <div className="w-12 h-12 rounded-full bg-[var(--background)] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <CheckSquare size={24} className="text-[var(--text)]" />
          </div>
          <span className="font-medium">Tasks</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Calendar Section */}
          <section className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 shadow-sm hover:border-[var(--text)]/20 transition-colors">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <CalendarIcon size={18} className="text-[var(--muted)]" />
                This Week
              </h2>
              <Link href="/calendar" className="text-sm font-medium text-[var(--muted)] hover:text-[var(--text)] transition flex items-center gap-1">
                View Month
              </Link>
            </div>
            <div className="grid grid-cols-7 gap-2">
              {weekDays.map((date) => {
                const dayItems = scheduledItems.filter(item => item.scheduledFor && isSameDay(new Date(item.scheduledFor), date));
                const isTodayDate = isToday(date);
                return (
                  <Link href="/calendar" key={date.toISOString()} className={`flex flex-col items-center justify-center p-3 rounded-xl border transition group hover:border-[var(--text)] hover:shadow-sm ${isTodayDate ? 'border-[var(--text)] bg-[var(--background)] shadow-sm' : 'border-[var(--border)] bg-[var(--background)]'}`}>
                    <span className={`text-xs uppercase tracking-wider ${isTodayDate ? 'text-[var(--text)] font-semibold' : 'text-[var(--muted)]'}`}>{format(date, 'EEE')}</span>
                    <span className={`text-lg font-medium mt-1 ${isTodayDate ? 'text-[var(--text)]' : ''}`}>{format(date, 'd')}</span>
                    <div className="flex gap-1 mt-3 h-1.5 min-h-[6px]">
                      {dayItems.slice(0, 3).map((item) => (
                        <div key={item.id} className={`w-1.5 h-1.5 rounded-full ${item.status === 'published' ? 'bg-green-500' : item.status === 'scheduled' ? 'bg-blue-500' : 'bg-[var(--muted)]'}`} />
                      ))}
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>

        </div>

        {/* Right Sidebar Area */}
        <div className="space-y-8">
          
          {/* Top Tasks */}
          <section className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <CheckSquare size={18} className="text-[var(--muted)]" />
                Top Tasks
              </h2>
              <Link href="/tasks" className="text-sm font-medium text-[var(--muted)] hover:text-[var(--text)] transition">
                View All
              </Link>
            </div>
            {topTasks.length === 0 ? (
              <div className="py-8 text-center">
                <div className="w-12 h-12 rounded-full bg-[var(--background)] border border-[var(--border)] flex items-center justify-center mx-auto mb-3">
                  <Check size={20} className="text-green-500" />
                </div>
                <p className="text-[var(--muted)] text-sm">All caught up.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {topTasks.map(task => (
                  <div key={task.id} className="flex items-start gap-3 p-3 bg-[var(--background)] border border-[var(--border)] rounded-xl group transition-colors hover:border-[var(--text)]/30">
                    <button type="button" 
                      onClick={() => handleTaskToggle(task.id, !!task.isCompleted)}
                      className="w-5 h-5 rounded border border-[var(--border)] mt-0.5 flex-shrink-0 flex items-center justify-center text-transparent hover:border-[var(--text)] transition-colors"
                      aria-label={`Mark ${task.title} complete`}
                    >
                      <Check size={14} className="opacity-0 hover:opacity-50" />
                    </button>
                    <Link href="/tasks" className="text-sm font-medium leading-snug hover:underline decoration-1 underline-offset-2">
                      {task.title}
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Pinned Projects */}
          <section className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Pin size={18} className="text-[var(--muted)]" />
                Pinned Projects
              </h2>
              <Link href="/projects" className="text-sm font-medium text-[var(--muted)] hover:text-[var(--text)] transition">
                View All
              </Link>
            </div>
            {pinnedProjects.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-[var(--muted)] text-sm">No pinned projects.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {pinnedProjects.map(project => (
                  <Link href={`/projects/${project.id}`} key={project.id} className="block p-4 bg-[var(--background)] border border-[var(--border)] rounded-xl hover:border-[var(--text)] transition group active:scale-[0.98]">
                    <h3 className="font-medium group-hover:translate-x-1 transition-transform">{project.title}</h3>
                  </Link>
                ))}
              </div>
            )}
          </section>

        </div>
      </div>
    </div>
  );
}
