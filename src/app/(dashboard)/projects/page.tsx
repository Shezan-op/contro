"use client";

import { useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { Plus, FolderOpen, Search, Pin, LayoutGrid, List, MoreVertical, Trash2, Archive, Copy } from "lucide-react";
import { useRouter } from "next/navigation";
import { SearchInput } from "@/components/ui/SearchInput";
import { ProjectService } from "@/services/ProjectService";
import Link from "next/link";
import { useToast } from "@/components/ui/Toast";

export default function ProjectsPage() {
  const { projects, workspaceId, refreshData } = useAppStore();
  const router = useRouter();
  const { toast } = useToast();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  
  // Sort pinned first, then by title
  const filteredProjects = projects
    .filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (a.isStarred && !b.isStarred) return -1;
      if (!a.isStarred && b.isStarred) return 1;
      return a.title.localeCompare(b.title);
    });

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workspaceId || !newTitle.trim()) return;
    
    try {
      const newProj = await ProjectService.create(workspaceId, newTitle.trim(), newDesc.trim());
      await refreshData();
      setNewTitle("");
      setNewDesc("");
      setIsCreating(false);
      toast('Project created successfully', 'success');
      router.push(`/projects/${newProj.id}`);
    } catch (error) {
      console.error(error);
      toast('Failed to create project', 'error');
    }
  };

  const handleTogglePin = async (e: React.MouseEvent, id: string, isPinned: boolean) => {
    e.preventDefault();
    e.stopPropagation();
    await ProjectService.togglePin(id, !isPinned);
    await refreshData();
  };

  const handleArchive = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    await ProjectService.archive(id);
    await refreshData();
    toast('Project archived', 'success');
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    await ProjectService.delete(id);
    await refreshData();
    toast('Project moved to trash', 'success');
  };

  const handleDuplicate = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    await ProjectService.duplicate(id);
    await refreshData();
    toast('Project duplicated', 'success');
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8 animate-fade-in">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Projects</h1>
          <p className="text-[var(--muted)] mt-1">Organize your content campaigns and collections.</p>
        </div>
        <button 
          onClick={() => setIsCreating(true)}
          className="flex items-center justify-center gap-2 bg-[var(--text)] text-[var(--background)] px-4 py-2 rounded-lg font-medium hover:opacity-90 transition active:scale-95 shadow-sm"
        >
          <Plus size={18} />
          New Project
        </button>
      </header>

      {isCreating && (
        <form onSubmit={handleCreateProject} className="bg-[var(--surface)] border border-[var(--text)] p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center gap-4 shadow-sm animate-fade-in">
          <div className="w-10 h-10 bg-[var(--background)] border border-[var(--border)] rounded-lg flex items-center justify-center shrink-0 hidden sm:flex">
            <FolderOpen size={20} className="text-[var(--text)]" />
          </div>
          <div className="flex-1 flex flex-col gap-2 w-full">
            <input
              autoFocus
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Project Name (e.g. Q4 Launch)"
              className="bg-transparent border-none outline-none font-medium placeholder:text-[var(--muted)] w-full"
            />
            <input
              type="text"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              placeholder="Optional description..."
              className="text-sm bg-transparent border-none outline-none text-[var(--muted)] placeholder:text-[var(--muted)]/50 w-full"
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end mt-2 sm:mt-0">
            <button 
              type="button" 
              onClick={() => setIsCreating(false)}
              className="px-3 py-1.5 text-sm font-medium text-[var(--muted)] hover:text-[var(--text)] transition"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={!newTitle.trim()}
              className="px-3 py-1.5 text-sm font-medium bg-[var(--text)] text-[var(--background)] rounded-md hover:opacity-90 transition disabled:opacity-50"
            >
              Create
            </button>
          </div>
        </form>
      )}

      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="w-full sm:max-w-md">
          <SearchInput 
            value={searchQuery}
            onChange={(val) => setSearchQuery(val)}
            placeholder="Search projects..."
          />
        </div>
        <div className="flex items-center gap-1 p-1 bg-[var(--surface)] border border-[var(--border)] rounded-lg">
          <button 
            onClick={() => setViewMode("grid")}
            className={`p-1.5 rounded-md transition ${viewMode === "grid" ? "bg-[var(--background)] text-[var(--text)] shadow-sm" : "text-[var(--muted)] hover:text-[var(--text)]"}`}
          >
            <LayoutGrid size={16} />
          </button>
          <button 
            onClick={() => setViewMode("list")}
            className={`p-1.5 rounded-md transition ${viewMode === "list" ? "bg-[var(--background)] text-[var(--text)] shadow-sm" : "text-[var(--muted)] hover:text-[var(--text)]"}`}
          >
            <List size={16} />
          </button>
        </div>
      </div>
      
      {filteredProjects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center border border-[var(--border)] border-dashed rounded-2xl">
          <div className="w-16 h-16 bg-[var(--surface)] border border-[var(--border)] rounded-full flex items-center justify-center mb-4 text-[var(--muted)]">
            <FolderOpen size={32} />
          </div>
          <h2 className="text-xl font-medium mb-2">No Projects Found</h2>
          <p className="text-[var(--muted)] max-w-md mx-auto mb-6">
            Group related content together in projects for better organization.
          </p>
          <button 
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-2 bg-[var(--background)] border border-[var(--border)] text-[var(--text)] px-4 py-2 rounded-lg font-medium hover:bg-[var(--surface)] transition active:scale-95 shadow-sm"
          >
            <Plus size={18} />
            Create Project
          </button>
        </div>
      ) : (
        <div className={viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6" : "flex flex-col gap-3"}>
          {filteredProjects.map(project => (
            <Link 
              key={project.id} 
              href={`/projects/${project.id}`}
              className={`group flex bg-[var(--surface)] border border-[var(--border)] rounded-2xl hover:border-[var(--text)] hover:shadow-sm transition-all active:scale-[0.99] ${
                viewMode === "grid" ? "flex-col p-5 h-full" : "flex-row items-center p-4 gap-4"
              }`}
            >
              <div className={`flex items-start justify-between ${viewMode === "grid" ? "mb-4 w-full" : "shrink-0"}`}>
                <div className="w-12 h-12 bg-[var(--background)] border border-[var(--border)] rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                  <FolderOpen size={24} className="text-[var(--text)]" />
                </div>
                {viewMode === "grid" && (
                  <button 
                    onClick={(e) => handleTogglePin(e, project.id, project.isStarred)}
                    className={`p-2 rounded-full transition ${project.isStarred ? 'text-[var(--text)]' : 'text-[var(--muted)] opacity-0 group-hover:opacity-100 hover:bg-[var(--background)]'}`}
                  >
                    <Pin size={16} className={project.isStarred ? 'fill-current' : ''} />
                  </button>
                )}
              </div>
              
              <div className={`flex flex-col ${viewMode === "grid" ? "flex-1" : "flex-1"}`}>
                <h3 className="font-semibold text-lg mb-1 group-hover:text-[var(--text)] flex items-center gap-2">
                  {project.title}
                  {viewMode === "list" && project.isStarred && <Pin size={14} className="text-[var(--text)] fill-current" />}
                </h3>
                <p className="text-sm font-medium text-[var(--muted)] line-clamp-2">
                  {project.description || 'No description provided.'}
                </p>
              </div>

              {viewMode === "list" && (
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={(e) => handleTogglePin(e, project.id, project.isStarred)} className="p-2 text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--background)] rounded-md transition" title={project.isStarred ? "Unpin" : "Pin"}>
                    <Pin size={18} className={project.isStarred ? 'fill-current' : ''} />
                  </button>
                  <button onClick={(e) => handleDuplicate(e, project.id)} className="p-2 text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--background)] rounded-md transition" title="Duplicate">
                    <Copy size={18} />
                  </button>
                  <button onClick={(e) => handleArchive(e, project.id)} className="p-2 text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--background)] rounded-md transition" title="Archive">
                    <Archive size={18} />
                  </button>
                  <button onClick={(e) => handleDelete(e, project.id)} className="p-2 text-red-400 hover:text-red-500 hover:bg-red-500/10 rounded-md transition" title="Delete">
                    <Trash2 size={18} />
                  </button>
                </div>
              )}

              {viewMode === "grid" && (
                <div className="mt-4 pt-4 border-t border-[var(--border)] flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={(e) => handleDuplicate(e, project.id)} className="p-1.5 text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--background)] rounded-md transition" title="Duplicate">
                    <Copy size={16} />
                  </button>
                  <button onClick={(e) => handleArchive(e, project.id)} className="p-1.5 text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--background)] rounded-md transition" title="Archive">
                    <Archive size={16} />
                  </button>
                  <button onClick={(e) => handleDelete(e, project.id)} className="p-1.5 text-red-400 hover:text-red-500 hover:bg-red-500/10 rounded-md transition" title="Delete">
                    <Trash2 size={16} />
                  </button>
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
