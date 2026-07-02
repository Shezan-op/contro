"use client";

import { useEffect, useState } from "react";
import { MoreHorizontal, Cloud, CloudOff, Info } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { Editor } from "@/components/features/Editor";
import { UniversalContent } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";
import { ContentService } from "@/services/ContentService";

export default function WriterPage() {
  const { isOffline, refreshData } = useAppStore();
  const [document, setDocument] = useState<Partial<UniversalContent>>({
    id: uuidv4(),
    title: "",
    body: {},
    tags: []
  });
  const [showMeta, setShowMeta] = useState(false);
  const [saveState, setSaveState] = useState<"Unsaved" | "Saving" | "Saved" | "Sync Pending">("Unsaved");

  // Debounced auto-save
  useEffect(() => {
    if (document.title === "" && (!document.body || Object.keys(document.body).length === 0)) return;

    const timeout = setTimeout(async () => {
      setSaveState("Saving");
      try {
        const existing = await ContentService.getById(document.id!);
        if (existing) {
          await ContentService.update(document.id!, {
            title: document.title,
            body: document.body,
            tags: document.tags,
          });
        } else {
          await ContentService.create({
            id: document.id!,
            type: 'DRAFT',
            title: document.title || 'Untitled',
            body: document.body,
            tags: document.tags || [],
          });
        }
        setSaveState(isOffline ? "Sync Pending" : "Saved");
        refreshData();
      } catch (e) {
        console.error(e);
        setSaveState("Unsaved");
      }
    }, 1500);

    return () => clearTimeout(timeout);
  }, [document.id, document.title, document.body, document.tags, isOffline, refreshData]);

  return (
    <div className="flex h-full bg-[var(--background)] relative">
      {/* Main Editor Area */}
      <div className={`flex-1 flex flex-col transition-all ${showMeta ? 'pr-80' : ''}`}>
        
        {/* Top bar */}
        <header className="h-14 flex items-center justify-between px-6 border-b border-[var(--border)]">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium px-2 py-1 bg-[var(--surface)] border border-[var(--border)] rounded text-[var(--muted)]">
              Draft
            </span>
            <div className="flex items-center gap-1 text-sm text-[var(--muted)]">
              {isOffline ? (
                <><CloudOff size={14} /> Offline</>
              ) : (
                <><Cloud size={14} /> {saveState}</>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowMeta(!showMeta)}
              className={`p-2 rounded-md transition ${showMeta ? 'bg-[var(--surface)] text-[var(--text)]' : 'text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface)]'}`}
            >
              <Info size={18} />
            </button>
            <button className="p-2 text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface)] rounded-md transition">
              <MoreHorizontal size={18} />
            </button>
            <button className="ml-2 px-4 py-1.5 bg-[var(--text)] text-[var(--background)] text-sm font-medium rounded-md hover:opacity-90 transition">
              Publish
            </button>
          </div>
        </header>

        {/* Editor Canvas */}
        <main className="flex-1 overflow-y-auto px-8 md:px-24 lg:px-48 py-12">
          <div className="max-w-3xl mx-auto space-y-6">
            <input
              type="text"
              placeholder="Post Title..."
              value={document.title}
              onChange={(e) => setDocument({ ...document, title: e.target.value })}
              className="w-full text-4xl font-semibold bg-transparent border-none outline-none text-[var(--text)] placeholder:text-[var(--muted)] tracking-tight"
            />
            
            <Editor 
              content={document.body}
              onChange={(body) => setDocument({ ...document, body })}
            />
          </div>
        </main>
      </div>

      {/* Meta Panel (Right Sidebar) */}
      {showMeta && (
        <aside className="w-80 h-full bg-[var(--surface)] border-l border-[var(--border)] absolute right-0 top-0 p-6 overflow-y-auto shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-lg">Document Details</h3>
            <button onClick={() => setShowMeta(false)} className="text-[var(--muted)] hover:text-[var(--text)]">
              &times;
            </button>
          </div>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--muted)]">Project</label>
              <select className="w-full p-2 bg-[var(--background)] border border-[var(--border)] rounded-md text-sm text-[var(--text)]">
                <option>No Project</option>
                <option>Content OS Launch</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--muted)]">Tags</label>
              <input type="text" placeholder="Add a tag..." className="w-full p-2 bg-[var(--background)] border border-[var(--border)] rounded-md text-sm text-[var(--text)]" />
            </div>
          </div>
        </aside>
      )}
    </div>
  );
}
