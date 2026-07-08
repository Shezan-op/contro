"use client";

import { useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { 
  Plus, 
  CheckSquare, 
  Trash2, 
  Calendar as CalendarIcon, 
  Flag,
  ChevronDown,
  ChevronRight,
  FolderOpen,
  Bell,
  Check,
  Copy
} from "lucide-react";
import { TaskService } from "@/services/TaskService";
import { SearchInput } from "@/components/ui/SearchInput";
import { useToast } from "@/components/ui/Toast";
import { UniversalContent } from "@/lib/db";
import { motion, AnimatePresence } from "framer-motion";

type TaskPriority = "low" | "medium" | "high";

interface Subtask {
  id: string;
  text: string;
  isCompleted: boolean;
}

export default function TasksPage() {
  const { tasks, projects, workspaceId, refreshData } = useAppStore();
  const { toast } = useToast();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMode, setFilterMode] = useState<"all" | "active" | "completed">("active");
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);

  const filteredTasks = tasks.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase());
    if (filterMode === "active") return matchesSearch && !t.isCompleted;
    if (filterMode === "completed") return matchesSearch && t.isCompleted;
    return matchesSearch;
  });



  const handleToggleCompletion = async (task: UniversalContent) => {
    await TaskService.update(task.id, { isCompleted: !task.isCompleted });
    await refreshData();
  };

  const handleDelete = async (id: string) => {
    await TaskService.deletePermanently(id);
    await refreshData();
    toast('Task deleted', 'success');
  };

  const handleUpdate = async (id: string, updates: Partial<UniversalContent>) => {
    await TaskService.update(id, updates);
    await refreshData();
  };

  const handleDuplicate = async (task: UniversalContent) => {
    if (!workspaceId) return;
    try {
      await TaskService.create(workspaceId, `${task.title} (Copy)`, {
        body: task.body,
        projectId: task.projectId,
        priority: task.priority,
        dueDate: task.dueDate
      });
      await refreshData();
      toast('Task duplicated', 'success');
    } catch (error) {
      console.error(error);
      toast('Failed to duplicate task', 'error');
    }
  };

  const handleAddSubtask = async (task: UniversalContent, text: string) => {
    if (!text.trim()) return;
    const currentBody = (task.body as Record<string, unknown>) || { subtasks: [] };
    const subtasks = (currentBody.subtasks as Subtask[]) || [];
    const newSubtask = { id: crypto.randomUUID(), text, isCompleted: false };
    await handleUpdate(task.id, { body: { ...currentBody, subtasks: [...subtasks, newSubtask] } });
  };

  const handleToggleSubtask = async (task: UniversalContent, subtaskId: string) => {
    const currentBody = (task.body as Record<string, unknown>) || { subtasks: [] };
    const subtasks = (currentBody.subtasks as Subtask[]) || [];
    const updated = subtasks.map((s: Subtask) => 
      s.id === subtaskId ? { ...s, isCompleted: !s.isCompleted } : s
    );
    await handleUpdate(task.id, { body: { ...currentBody, subtasks: updated } });
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8 animate-fade-in">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-[var(--text)]">Tasks</h1>
          <p className="text-[var(--muted)] mt-2 text-lg">Organize your work and manage priorities.</p>
        </div>
        <button 
          type="button" 
          onClick={() => {
            const input = document.querySelector('input[aria-label="New task title"]') as HTMLInputElement;
            if (input) input.focus();
          }}
          className="flex items-center gap-2 bg-[var(--text)] text-[var(--background)] px-4 py-2 rounded-lg font-medium hover:opacity-90 transition active:scale-95"
        >
          <Plus size={18} />
          New Task
        </button>
      </header>

      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-[var(--surface)] p-2 rounded-xl border border-[var(--border)] shadow-sm">
        <div className="w-full sm:max-w-md px-2">
          <SearchInput 
            value={searchQuery}
            onChange={(val) => setSearchQuery(val)}
            placeholder="Search tasks..."
          />
        </div>
        <div className="flex items-center gap-1 bg-[var(--background)] p-1 rounded-lg border border-[var(--border)] w-full sm:w-auto">
          {["active", "completed", "all"].map((mode) => (
            <button 
              key={mode}
              type="button" 
              onClick={() => setFilterMode(mode as "active" | "completed" | "all")}
              className={`flex-1 sm:flex-none px-4 py-2 text-sm font-medium rounded-md transition capitalize ${
                filterMode === mode 
                  ? "bg-[var(--text)] text-[var(--background)] shadow-sm" 
                  : "text-[var(--muted)] hover:text-[var(--text)]"
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>
      
      <div className="space-y-6">
        <form 
          onSubmit={async (e) => {
            e.preventDefault();
            if (!workspaceId) {
              toast('Workspace not initialized. Please refresh.', 'error');
              return;
            }
            if (!newTaskTitle.trim()) return;
            
            try {
              await TaskService.create(workspaceId, newTaskTitle.trim(), {
                body: { subtasks: [] },
              });
              await refreshData();
              setNewTaskTitle("");
              toast('Task added', 'success');
            } catch (error) {
              console.error(error);
              toast('Failed to add task', 'error');
            }
          }}
          className="flex items-center gap-4 p-4 bg-[var(--background)] border-2 border-[var(--border)] rounded-xl focus-within:border-[var(--text)] transition-colors shadow-sm group"
        >
          <div className="w-6 h-6 rounded-md border-2 border-[var(--border)] flex-shrink-0 group-focus-within:border-[var(--muted)] transition-colors" />
          <input
            aria-label="New task title"
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="What needs to be done?"
            className="flex-1 bg-transparent border-none outline-none font-medium text-lg placeholder:text-[var(--muted)]"
          />
          <button 
            type="submit"
            disabled={!newTaskTitle.trim()}
            className="text-[var(--background)] bg-[var(--text)] p-2 rounded-lg opacity-90 hover:opacity-100 disabled:opacity-20 disabled:bg-[var(--muted)] transition shadow-sm"
            aria-label="Add task"
          >
            <Plus size={20} />
          </button>
        </form>

        {filteredTasks.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-24 text-center border border-[var(--border)] border-dashed rounded-2xl bg-[var(--surface)]/50"
          >
            <div className="w-16 h-16 bg-[var(--background)] border border-[var(--border)] rounded-2xl flex items-center justify-center mb-6 text-[var(--muted)] shadow-sm rotate-3">
              <CheckSquare size={32} />
            </div>
            <h3 className="text-xl font-semibold mb-2">You&apos;re all caught up</h3>
            <p className="text-[var(--muted)] max-w-sm">No tasks match your current filters. Take a break or add a new task above.</p>
          </motion.div>
        ) : (
          <div className="flex flex-col gap-3">
            <AnimatePresence>
              {filteredTasks.map(task => {
                const isExpanded = expandedTaskId === task.id;
                const body = (task.body as Record<string, unknown>) || {};
                const subtasks: Subtask[] = (body.subtasks as Subtask[]) || [];
                const completedSubtasks = subtasks.filter(s => s.isCompleted).length;
                
                return (
                  <motion.div 
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    key={task.id} 
                    className={`group flex flex-col bg-[var(--surface)] border rounded-xl hover:border-[var(--text)] transition-colors shadow-sm overflow-hidden ${
                      task.isCompleted ? 'border-transparent opacity-60 bg-[var(--background)]' : 'border-[var(--border)]'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-4">
                      <div className="flex items-center gap-3 flex-1">
                        <button type="button" 
                          onClick={() => handleToggleCompletion(task)}
                          className={`w-6 h-6 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                            task.isCompleted 
                              ? 'border-[var(--text)] bg-[var(--text)] text-[var(--background)]' 
                              : 'border-[var(--border)] group-hover:border-[var(--text)]'
                          }`}
                        >
                          {task.isCompleted && <Check size={16} strokeWidth={3} />}
                        </button>
                        
                        <div className="flex flex-col flex-1 cursor-pointer" onClick={() => setExpandedTaskId(isExpanded ? null : task.id)}>
                          <h3 className={`font-medium text-lg transition-colors ${task.isCompleted ? 'line-through text-[var(--muted)]' : 'text-[var(--text)]'}`}>
                            {task.title}
                          </h3>
                          {subtasks.length > 0 && (
                            <div className="flex items-center gap-2 text-xs text-[var(--muted)] mt-1">
                              <CheckSquare size={12} />
                              <span>{completedSubtasks} / {subtasks.length} subtasks</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 pl-9 sm:pl-0 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity flex-wrap sm:flex-nowrap">
                        {task.projectId && (
                          <div className="flex items-center bg-[var(--background)] border border-[var(--border)] rounded-md px-2 py-1.5 gap-1.5 text-xs font-medium text-[var(--muted)]" title="Project">
                            <FolderOpen size={14} />
                            {projects.find(p => p.id === task.projectId)?.title || "Project"}
                          </div>
                        )}
                        
                        <div className="flex items-center bg-[var(--background)] border border-[var(--border)] rounded-md px-2 py-1.5 gap-1.5 text-xs text-[var(--muted)]">
                          <CalendarIcon size={14} />
                          <input 
                            aria-label={`Due date`}
                            type="date"
                            defaultValue={task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''}
                            onBlur={(e) => handleUpdate(task.id, { dueDate: e.target.value ? new Date(e.target.value).toISOString() : undefined })}
                            className="bg-transparent border-none outline-none text-[var(--text)] [&::-webkit-calendar-picker-indicator]:opacity-50 hover:[&::-webkit-calendar-picker-indicator]:opacity-100 cursor-pointer"
                          />
                        </div>
                        
                        <div className="flex items-center bg-[var(--background)] border border-[var(--border)] rounded-md px-2 py-1.5 gap-1.5 cursor-pointer">
                          <Flag size={14} className={`${task.priority === 'high' ? 'text-red-500' : task.priority === 'medium' ? 'text-yellow-500' : 'text-green-500'}`} />
                          <select
                            value={task.priority || 'low'}
                            onChange={(e) => handleUpdate(task.id, { priority: e.target.value as TaskPriority })}
                            className="bg-transparent border-none outline-none text-xs text-[var(--text)] cursor-pointer font-medium appearance-none"
                          >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                          </select>
                        </div>
                        
                        <button type="button" 
                          onClick={() => setExpandedTaskId(isExpanded ? null : task.id)}
                          className="p-1.5 text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--background)] rounded-md transition border border-transparent hover:border-[var(--border)]"
                        >
                          {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                        </button>
                      </div>
                    </div>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="border-t border-[var(--border)] bg-[var(--background)]/50"
                        >
                          <div className="p-4 pl-12 sm:pl-14 space-y-6">
                            {/* Description */}
                            <div className="space-y-2">
                              <label className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">Description</label>
                              <textarea 
                                defaultValue={task.description || ""}
                                onBlur={(e) => handleUpdate(task.id, { description: e.target.value })}
                                placeholder="Add more details about this task..."
                                className="w-full bg-transparent border border-[var(--border)] rounded-lg p-3 text-sm focus:border-[var(--text)] outline-none min-h-[80px] resize-y"
                              />
                            </div>

                            {/* Subtasks */}
                            <div className="space-y-3">
                              <label className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">Subtasks</label>
                              <div className="space-y-2">
                                {subtasks.map((st: Subtask) => (
                                  <div key={st.id} className="flex items-center gap-3 group/st">
                                    <button 
                                      onClick={() => handleToggleSubtask(task, st.id)}
                                      className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${st.isCompleted ? 'bg-[var(--text)] border-[var(--text)] text-[var(--background)]' : 'border-[var(--border)]'}`}
                                    >
                                      {st.isCompleted && <Check size={10} strokeWidth={3} />}
                                    </button>
                                    <span className={`text-sm ${st.isCompleted ? 'line-through text-[var(--muted)]' : 'text-[var(--text)]'}`}>
                                      {st.text}
                                    </span>
                                  </div>
                                ))}
                                <div className="flex items-center gap-3 text-sm text-[var(--muted)]">
                                  <Plus size={16} />
                                  <input 
                                    type="text" 
                                    placeholder="Add subtask..."
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        handleAddSubtask(task, e.currentTarget.value);
                                        e.currentTarget.value = "";
                                      }
                                    }}
                                    className="bg-transparent border-none outline-none w-full"
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Settings row */}
                            <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-[var(--border)]">
                              <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
                                  <FolderOpen size={16} />
                                  <select 
                                    value={task.projectId || ""}
                                    onChange={(e) => handleUpdate(task.id, { projectId: e.target.value || undefined })}
                                    className="bg-transparent border-none outline-none font-medium text-[var(--text)] cursor-pointer"
                                  >
                                    <option value="">No Project</option>
                                    {projects.map(p => (
                                      <option key={p.id} value={p.id}>{p.title}</option>
                                    ))}
                                  </select>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
                                  <Bell size={16} />
                                  <input 
                                    type="datetime-local" 
                                    defaultValue={task.reminder ? task.reminder.slice(0, 16) : ""}
                                    onBlur={(e) => handleUpdate(task.id, { reminder: e.target.value ? new Date(e.target.value).toISOString() : null })}
                                    className="bg-transparent border-none outline-none font-medium text-[var(--text)] cursor-pointer"
                                  />
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <button 
                                  onClick={() => handleDuplicate(task)}
                                  className="text-[var(--muted)] hover:text-[var(--text)] text-sm font-medium px-3 py-1.5 rounded-md hover:bg-[var(--surface)] transition flex items-center gap-2"
                                >
                                  <Copy size={16} />
                                  Duplicate
                                </button>
                                <button 
                                  onClick={() => handleDelete(task.id)}
                                  className="text-red-500 hover:text-red-600 text-sm font-medium px-3 py-1.5 rounded-md hover:bg-red-500/10 transition flex items-center gap-2"
                                >
                                  <Trash2 size={16} />
                                  Delete
                                </button>
                              </div>
                            </div>

                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Floating + button for mobile */}
      <button 
        onClick={() => {
          const input = document.querySelector('input[aria-label="New task title"]') as HTMLInputElement;
          if (input) {
            input.scrollIntoView({ behavior: 'smooth' });
            setTimeout(() => input.focus(), 300);
          }
        }}
        className="md:hidden fixed bottom-6 right-6 w-14 h-14 bg-[var(--text)] text-[var(--background)] rounded-full shadow-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-transform z-40"
      >
        <Plus size={24} />
      </button>
    </div>
  );
}
