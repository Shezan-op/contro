"use client";

import { useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { Plus, CheckSquare, Trash2, Calendar as CalendarIcon, Flag } from "lucide-react";
import { TaskService } from "@/services/TaskService";
import { SearchInput } from "@/components/ui/SearchInput";
import { useToast } from "@/components/ui/Toast";
import { UniversalContent } from "@/lib/db";

export default function TasksPage() {
  const { tasks, workspaceId, refreshData } = useAppStore();
  const { toast } = useToast();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMode, setFilterMode] = useState<"all" | "active" | "completed">("active");
  const [newTaskTitle, setNewTaskTitle] = useState("");

  const filteredTasks = tasks.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase());
    if (filterMode === "active") return matchesSearch && !t.isCompleted;
    if (filterMode === "completed") return matchesSearch && t.isCompleted;
    return matchesSearch;
  });

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workspaceId || !newTaskTitle.trim()) return;
    
    try {
      await TaskService.create(workspaceId, newTaskTitle.trim());
      await refreshData();
      setNewTaskTitle("");
      toast('Task added', 'success');
    } catch (error) {
      console.error(error);
      toast('Failed to add task', 'error');
    }
  };

  const handleToggleCompletion = async (task: UniversalContent) => {
    await TaskService.toggleCompletion(task.id, !task.isCompleted);
    await refreshData();
  };

  const handleDelete = async (id: string) => {
    await TaskService.delete(id);
    await refreshData();
    toast('Task deleted', 'success');
  };

  const handleSetPriority = async (id: string, priority: 'low' | 'medium' | 'high') => {
    await TaskService.update(id, { priority });
    await refreshData();
  };

  // Due date input triggers an update on blur
  const handleUpdateDueDate = async (id: string, dateStr: string) => {
    const dueDate = dateStr ? new Date(dateStr).toISOString() : null;
    await TaskService.update(id, { dueDate });
    await refreshData();
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8 animate-fade-in">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Tasks</h1>
          <p className="text-[var(--muted)] mt-1">Manage your to-dos and content workflow.</p>
        </div>
      </header>

      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="w-full sm:max-w-md">
          <SearchInput 
            value={searchQuery}
            onChange={(val) => setSearchQuery(val)}
            placeholder="Search tasks..."
          />
        </div>
        <div className="flex items-center gap-1 p-1 bg-[var(--surface)] border border-[var(--border)] rounded-lg">
          <button 
            onClick={() => setFilterMode("active")}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition ${filterMode === "active" ? "bg-[var(--background)] text-[var(--text)] shadow-sm" : "text-[var(--muted)] hover:text-[var(--text)]"}`}
          >
            Active
          </button>
          <button 
            onClick={() => setFilterMode("completed")}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition ${filterMode === "completed" ? "bg-[var(--background)] text-[var(--text)] shadow-sm" : "text-[var(--muted)] hover:text-[var(--text)]"}`}
          >
            Completed
          </button>
          <button 
            onClick={() => setFilterMode("all")}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition ${filterMode === "all" ? "bg-[var(--background)] text-[var(--text)] shadow-sm" : "text-[var(--muted)] hover:text-[var(--text)]"}`}
          >
            All
          </button>
        </div>
      </div>
      
      <div className="space-y-4">
        <form onSubmit={handleCreateTask} className="flex items-center gap-3 p-4 bg-[var(--surface)] border border-[var(--border)] rounded-xl focus-within:border-[var(--text)] transition-colors shadow-sm">
          <div className="w-5 h-5 rounded border border-[var(--border)] flex-shrink-0" />
          <input
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="What needs to be done?"
            className="flex-1 bg-transparent border-none outline-none font-medium placeholder:text-[var(--muted)]"
          />
          <button 
            type="submit"
            disabled={!newTaskTitle.trim()}
            className="text-[var(--text)] opacity-50 hover:opacity-100 disabled:opacity-20 transition"
          >
            <Plus size={20} />
          </button>
        </form>

        {filteredTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center border border-[var(--border)] border-dashed rounded-2xl">
            <div className="w-12 h-12 bg-[var(--surface)] border border-[var(--border)] rounded-full flex items-center justify-center mb-4 text-[var(--muted)]">
              <CheckSquare size={24} />
            </div>
            <p className="text-[var(--muted)]">No tasks found.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {filteredTasks.map(task => (
              <div 
                key={task.id} 
                className={`group flex flex-col sm:flex-row sm:items-center gap-3 p-4 bg-[var(--surface)] border border-[var(--border)] rounded-xl hover:border-[var(--text)] transition-all shadow-sm ${task.isCompleted ? 'opacity-60 bg-[var(--background)]' : ''}`}
              >
                <div className="flex items-center gap-3 flex-1">
                  <button 
                    onClick={() => handleToggleCompletion(task)}
                    className={`w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${task.isCompleted ? 'border-[var(--text)] bg-[var(--text)] text-[var(--background)]' : 'border-[var(--border)] group-hover:border-[var(--text)]'}`}
                  >
                    {task.isCompleted && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    )}
                  </button>
                  <h3 className={`font-medium flex-1 ${task.isCompleted ? 'line-through text-[var(--muted)]' : ''}`}>
                    {task.title}
                  </h3>
                </div>
                
                <div className="flex items-center gap-2 pl-8 sm:pl-0 sm:opacity-0 group-hover:opacity-100 transition-opacity flex-wrap sm:flex-nowrap">
                  <div className="flex items-center bg-[var(--background)] border border-[var(--border)] rounded-md px-2 py-1 gap-1 text-sm">
                    <CalendarIcon size={14} className="text-[var(--muted)]" />
                    <input 
                      type="date"
                      defaultValue={task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''}
                      onBlur={(e) => handleUpdateDueDate(task.id, e.target.value)}
                      className="bg-transparent border-none outline-none text-[var(--text)] text-xs [&::-webkit-calendar-picker-indicator]:opacity-50 [&::-webkit-calendar-picker-indicator]:hover:opacity-100"
                    />
                  </div>
                  
                  <div className="flex items-center bg-[var(--background)] border border-[var(--border)] rounded-md">
                    <select
                      value={task.priority || 'low'}
                      onChange={(e) => handleSetPriority(task.id, e.target.value as any)}
                      className="bg-transparent border-none outline-none text-xs px-2 py-1.5 appearance-none cursor-pointer flex items-center gap-1"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                    <Flag size={14} className={`mr-2 pointer-events-none ${task.priority === 'high' ? 'text-red-500' : task.priority === 'medium' ? 'text-yellow-500' : 'text-green-500'}`} />
                  </div>
                  
                  <button 
                    onClick={() => handleDelete(task.id)}
                    className="p-1.5 text-red-400 hover:text-red-500 hover:bg-red-500/10 rounded-md transition ml-1"
                    title="Delete Task"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
