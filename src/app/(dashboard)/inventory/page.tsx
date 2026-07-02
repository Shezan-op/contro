"use client";

import { useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { Plus, FolderOpen, LibraryBig, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { SearchInput } from "@/components/ui/SearchInput";
import { InventoryService } from "@/services/InventoryService";
import Link from "next/link";
import { useToast } from "@/components/ui/Toast";

export default function InventoryPage() {
  const { inventoryLibraries, inventoryCounts, workspaceId, refreshData } = useAppStore();
  const router = useRouter();
  const { toast } = useToast();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [newLibraryName, setNewLibraryName] = useState("");

  const filteredLibraries = inventoryLibraries.filter(lib => 
    lib.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateLibrary = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workspaceId || !newLibraryName.trim()) return;
    
    try {
      const newLib = await InventoryService.createLibrary(workspaceId, newLibraryName.trim());
      await refreshData();
      setNewLibraryName("");
      setIsCreating(false);
      toast('Library created successfully', 'success');
      router.push(`/inventory/${newLib.id}`);
    } catch (error) {
      console.error(error);
      toast('Failed to create library', 'error');
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8 animate-fade-in">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Inventory</h1>
          <p className="text-[var(--muted)] mt-1">Your permanent library of reusable content assets.</p>
        </div>
        <button type="button" 
          onClick={() => setIsCreating(true)}
          className="flex items-center justify-center gap-2 bg-[var(--text)] text-[var(--background)] px-4 py-2 rounded-lg font-medium hover:opacity-90 transition active:scale-95 shadow-sm"
        >
          <Plus size={18} />
          New Library
        </button>
      </header>

      {isCreating && (
        <form onSubmit={handleCreateLibrary} className="bg-[var(--surface)] border border-[var(--text)] p-4 rounded-xl flex items-center gap-4 shadow-sm animate-fade-in">
          <div className="w-10 h-10 bg-[var(--background)] border border-[var(--border)] rounded-lg flex items-center justify-center shrink-0">
            <LibraryBig size={20} className="text-[var(--text)]" />
          </div>
          <input
            aria-label="Library name"
            type="text"
            value={newLibraryName}
            onChange={(e) => setNewLibraryName(e.target.value)}
            placeholder="Library name (e.g. Hooks, CTAs, Offers)"
            className="flex-1 bg-transparent border-none outline-none font-medium placeholder:text-[var(--muted)]"
          />
          <div className="flex items-center gap-2">
            <button 
              type="button" 
              onClick={() => setIsCreating(false)}
              className="px-3 py-1.5 text-sm font-medium text-[var(--muted)] hover:text-[var(--text)] transition"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={!newLibraryName.trim()}
              className="px-3 py-1.5 text-sm font-medium bg-[var(--text)] text-[var(--background)] rounded-md hover:opacity-90 transition disabled:opacity-50"
            >
              Create
            </button>
          </div>
        </form>
      )}

      <div className="flex gap-4 items-center">
        <div className="w-full max-w-md">
          <SearchInput 
            value={searchQuery}
            onChange={(val) => setSearchQuery(val)}
            placeholder="Search libraries..."
          />
        </div>
      </div>
      
      {filteredLibraries.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center border border-[var(--border)] border-dashed rounded-2xl">
          <div className="w-16 h-16 bg-[var(--surface)] border border-[var(--border)] rounded-full flex items-center justify-center mb-4 text-[var(--muted)]">
            <LibraryBig size={32} />
          </div>
          <h2 className="text-xl font-medium mb-2">No Libraries Found</h2>
          <p className="text-[var(--muted)] max-w-md mx-auto mb-6">
            Create a library to store and organize your reusable content assets.
          </p>
          <button type="button" 
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-2 bg-[var(--background)] border border-[var(--border)] text-[var(--text)] px-4 py-2 rounded-lg font-medium hover:bg-[var(--surface)] transition active:scale-95 shadow-sm"
          >
            <Plus size={18} />
            Create Library
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {filteredLibraries.map(lib => (
            <Link 
              key={lib.id} 
              href={`/inventory/${lib.id}`}
              className="flex flex-col p-5 bg-[var(--surface)] border border-[var(--border)] rounded-2xl hover:border-[var(--text)] hover:shadow-sm transition-all group active:scale-[0.98]"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-[var(--background)] border border-[var(--border)] rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                  <FolderOpen size={24} className="text-[var(--text)]" />
                </div>
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--muted)] group-hover:text-[var(--text)] group-hover:bg-[var(--background)] transition-colors">
                  <ArrowRight size={18} className="-rotate-45 group-hover:rotate-0 transition-transform" />
                </div>
              </div>
              <h3 className="font-semibold text-lg mb-1 group-hover:text-[var(--text)]">{lib.name}</h3>
              <p className="text-sm font-medium text-[var(--muted)]">
                {inventoryCounts[lib.id] || 0} {(inventoryCounts[lib.id] === 1) ? 'item' : 'items'}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
