"use client";

import { useState, useEffect } from "react";
import { SearchInput } from "@/components/ui/SearchInput";
import { useAppStore } from "@/store/useAppStore";
import { ContentService } from "@/services/ContentService";
import { InventoryService } from "@/services/InventoryService";
import { UniversalContent, InventoryItem } from "@/lib/db";
import Link from "next/link";
import { Search as SearchIcon, FileText, FolderOpen, CheckSquare, BookOpen, Bookmark } from "lucide-react";
import { useRouter } from "next/navigation";

function getIconForType(type: string) {
  switch(type) {
    case 'DRAFT': return <FileText size={16} className="text-blue-500" />;
    case 'PROJECT': return <FolderOpen size={16} className="text-purple-500" />;
    case 'TASK': return <CheckSquare size={16} className="text-green-500" />;
    case 'LEAD_MAGNET': return <BookOpen size={16} className="text-orange-500" />;
    default: return <FileText size={16} />;
  }
}

function getLinkForType(item: UniversalContent) {
  switch(item.type) {
    case 'DRAFT': return `/writer`;
    case 'PROJECT': return `/projects/${item.id}`;
    case 'TASK': return `/tasks`;
    case 'LEAD_MAGNET': return `/lead-magnets/${item.id}`;
    default: return '#';
  }
}

export default function SearchPage() {
  const { workspaceId } = useAppStore();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  
  const [contentResults, setContentResults] = useState<UniversalContent[]>([]);
  const [inventoryResults, setInventoryResults] = useState<(InventoryItem & { libraryName: string })[]>([]);

  useEffect(() => {
    const performSearch = async () => {
      if (!workspaceId) return;
      if (!query.trim()) {
        setContentResults([]);
        setInventoryResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const content = await ContentService.search(workspaceId, query);
        const inventory = await InventoryService.searchItems(workspaceId, query);
        setContentResults(content);
        setInventoryResults(inventory);
      } catch (error) {
        console.error("Search failed:", error);
      } finally {
        setIsSearching(false);
      }
    };

    const debounce = setTimeout(performSearch, 300);
    return () => clearTimeout(debounce);
  }, [query, workspaceId]);

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8 animate-fade-in">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">Search</h1>
        <p className="text-[var(--muted)] mt-1">Find content, projects, tasks, and inventory items across your workspace.</p>
      </header>

      <div className="sticky top-0 bg-[var(--background)] py-4 z-10 border-b border-[var(--border)]">
        <SearchInput 
          value={query}
          onChange={setQuery}
          placeholder="Type to search globally..."
        />
      </div>

      <div className="space-y-8">
        {!query.trim() && (
          <div className="flex flex-col items-center justify-center py-24 text-center border border-[var(--border)] border-dashed rounded-2xl">
            <div className="w-16 h-16 bg-[var(--surface)] border border-[var(--border)] rounded-full flex items-center justify-center mb-4 text-[var(--muted)]">
              <SearchIcon size={32} />
            </div>
            <h2 className="text-xl font-medium mb-2">Search Everything</h2>
            <p className="text-[var(--muted)] max-w-md mx-auto">
              Enter a keyword to instantly find posts, projects, tasks, or inventory snippets.
            </p>
          </div>
        )}

        {isSearching && query.trim() && (
          <div className="text-center py-12 text-[var(--muted)] animate-pulse">
            Searching...
          </div>
        )}

        {!isSearching && query.trim() && contentResults.length === 0 && inventoryResults.length === 0 && (
          <div className="text-center py-12 text-[var(--muted)]">
            No results found for &quot;{query}&quot;.
          </div>
        )}

        {/* Content Results */}
        {!isSearching && contentResults.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--muted)]">Workspace Content ({contentResults.length})</h3>
            <div className="flex flex-col gap-2">
              {contentResults.map(item => (
                <Link 
                  key={item.id} 
                  href={getLinkForType(item)}
                  className="flex items-start gap-4 p-4 bg-[var(--surface)] border border-[var(--border)] rounded-xl hover:border-[var(--text)] transition group active:scale-[0.99]"
                >
                  <div className="mt-0.5 p-2 bg-[var(--background)] rounded-lg border border-[var(--border)]">
                    {getIconForType(item.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-[var(--text)] group-hover:underline truncate">{item.title || 'Untitled'}</h4>
                      <span className="text-xs px-1.5 py-0.5 bg-[var(--background)] border border-[var(--border)] rounded text-[var(--muted)] capitalize">
                        {item.type.toLowerCase().replace('_', ' ')}
                      </span>
                    </div>
                    {item.description && (
                      <p className="text-sm text-[var(--muted)] line-clamp-1">{item.description}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Inventory Results */}
        {!isSearching && inventoryResults.length > 0 && (
          <div className="space-y-4 mt-8">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--muted)]">Inventory Items ({inventoryResults.length})</h3>
            <div className="flex flex-col gap-2">
              {inventoryResults.map(item => (
                <button
                  type="button"
                  key={item.id} 
                  className="flex w-full text-left items-start gap-4 p-4 bg-[var(--surface)] border border-[var(--border)] rounded-xl hover:border-[var(--text)] transition group cursor-pointer active:scale-[0.99]"
                  onClick={() => router.push(`/inventory/${item.libraryId}`)}
                >
                  <div className="mt-0.5 p-2 bg-[var(--background)] rounded-lg border border-[var(--border)]">
                    <Bookmark size={16} className="text-yellow-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs px-1.5 py-0.5 bg-[var(--background)] border border-[var(--border)] rounded text-[var(--muted)] font-medium">
                        {item.libraryName}
                      </span>
                    </div>
                    <p className="text-sm text-[var(--text)] line-clamp-3 leading-relaxed">{item.text}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
