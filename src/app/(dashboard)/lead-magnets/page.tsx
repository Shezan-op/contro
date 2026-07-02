"use client";

import { useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { Plus, BookOpen, Search, Trash2, Copy, FileText, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { SearchInput } from "@/components/ui/SearchInput";
import { LeadMagnetService } from "@/services/LeadMagnetService";
import Link from "next/link";
import { useToast } from "@/components/ui/Toast";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { UniversalContent } from "@/lib/db";

export default function LeadMagnetsPage() {
  const { leadMagnets, workspaceId, refreshData } = useAppStore();
  const router = useRouter();
  const { toast } = useToast();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filteredLeadMagnets = leadMagnets
    .filter(lm => lm.title.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => a.title.localeCompare(b.title));

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workspaceId || !newTitle.trim()) return;
    
    try {
      const newLM = await LeadMagnetService.create(workspaceId, newTitle.trim(), newDesc.trim());
      await refreshData();
      setNewTitle("");
      setNewDesc("");
      setIsCreating(false);
      toast('Lead Magnet created', 'success');
      router.push(`/lead-magnets/${newLM.id}`);
    } catch (error) {
      console.error(error);
      toast('Failed to create lead magnet', 'error');
    }
  };

  const handleDelete = async () => {
    if (deletingId) {
      await LeadMagnetService.delete(deletingId);
      await refreshData();
      setDeletingId(null);
      toast('Lead Magnet moved to trash', 'success');
    }
  };

  const handleDuplicate = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    await LeadMagnetService.duplicate(id);
    await refreshData();
    toast('Lead Magnet duplicated', 'success');
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8 animate-fade-in">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Lead Magnets</h1>
          <p className="text-[var(--muted)] mt-1">Manage and track your free resources and lead capture tools.</p>
        </div>
        <button 
          onClick={() => setIsCreating(true)}
          className="flex items-center justify-center gap-2 bg-[var(--text)] text-[var(--background)] px-4 py-2 rounded-lg font-medium hover:opacity-90 transition active:scale-95 shadow-sm"
        >
          <Plus size={18} />
          New Lead Magnet
        </button>
      </header>

      {isCreating && (
        <form onSubmit={handleCreate} className="bg-[var(--surface)] border border-[var(--text)] p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center gap-4 shadow-sm animate-fade-in">
          <div className="w-10 h-10 bg-[var(--background)] border border-[var(--border)] rounded-lg flex items-center justify-center shrink-0 hidden sm:flex">
            <BookOpen size={20} className="text-[var(--text)]" />
          </div>
          <div className="flex-1 flex flex-col gap-2 w-full">
            <input
              autoFocus
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Lead Magnet Title (e.g. 50 Hooks Cheat Sheet)"
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
            placeholder="Search lead magnets..."
          />
        </div>
      </div>
      
      {filteredLeadMagnets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center border border-[var(--border)] border-dashed rounded-2xl">
          <div className="w-16 h-16 bg-[var(--surface)] border border-[var(--border)] rounded-full flex items-center justify-center mb-4 text-[var(--muted)]">
            <BookOpen size={32} />
          </div>
          <h2 className="text-xl font-medium mb-2">No Lead Magnets Found</h2>
          <p className="text-[var(--muted)] max-w-md mx-auto mb-6">
            Create lead magnets to capture emails and grow your audience. You can host PDFs, Notion templates, or other resources.
          </p>
          <button 
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-2 bg-[var(--background)] border border-[var(--border)] text-[var(--text)] px-4 py-2 rounded-lg font-medium hover:bg-[var(--surface)] transition active:scale-95 shadow-sm"
          >
            <Plus size={18} />
            Create Your First
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {filteredLeadMagnets.map(lm => (
            <Link 
              key={lm.id} 
              href={`/lead-magnets/${lm.id}`}
              className="group flex flex-col p-5 bg-[var(--surface)] border border-[var(--border)] rounded-2xl hover:border-[var(--text)] hover:shadow-sm transition-all active:scale-[0.99] h-full"
            >
              <div className="flex items-start justify-between mb-4 w-full">
                <div className="w-12 h-12 bg-[var(--background)] border border-[var(--border)] rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                  <BookOpen size={24} className="text-[var(--text)]" />
                </div>
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--muted)] group-hover:text-[var(--text)] group-hover:bg-[var(--background)] transition-colors">
                  <ArrowRight size={18} className="-rotate-45 group-hover:rotate-0 transition-transform" />
                </div>
              </div>
              
              <div className="flex flex-col flex-1">
                <h3 className="font-semibold text-lg mb-1 group-hover:text-[var(--text)] flex items-center gap-2">
                  {lm.title}
                </h3>
                <p className="text-sm font-medium text-[var(--muted)] line-clamp-2">
                  {lm.description || 'No description provided.'}
                </p>
              </div>

              <div className="mt-4 pt-4 border-t border-[var(--border)] flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={(e) => handleDuplicate(e, lm.id)} className="p-1.5 text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--background)] rounded-md transition" title="Duplicate">
                  <Copy size={16} />
                </button>
                <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setDeletingId(lm.id); }} className="p-1.5 text-red-400 hover:text-red-500 hover:bg-red-500/10 rounded-md transition" title="Delete">
                  <Trash2 size={16} />
                </button>
              </div>
            </Link>
          ))}
        </div>
      )}

      <ConfirmDialog
        isOpen={!!deletingId}
        title="Delete Lead Magnet?"
        message="Are you sure you want to move this lead magnet to the trash?"
        confirmLabel="Move to Trash"
        isDestructive
        onConfirm={handleDelete}
        onCancel={() => setDeletingId(null)}
      />
    </div>
  );
}
