import { useRouter } from "next/navigation";
import { ArrowLeft, Info, Copy, Trash2, RotateCcw } from "lucide-react";
import { UniversalContent } from "@/lib/db";

interface WriterHeaderProps {
  document?: Partial<UniversalContent>;
  isOffline?: boolean;
  saveState: "Unsaved" | "Saving" | "Saved" | "Sync Pending";
  showMeta: boolean;
  setShowMeta: (show: boolean) => void;
  handleCopy: () => void;
  handleDuplicate: () => void;
  setConfirmDialog: (dialog: { isOpen: boolean; action: 'delete' | 'clear' | 'publish' | null }) => void;
  onSave?: () => void;
}

export function WriterHeader({
  saveState,
  showMeta,
  setShowMeta,
  handleCopy,
  setConfirmDialog,
  onSave
}: WriterHeaderProps) {
  const router = useRouter();

  return (
    <header className="h-14 flex items-center justify-between px-4 md:px-6 border-b border-[var(--border)] shrink-0 bg-[var(--background)]">
      <div className="flex items-center">
        <button type="button" 
          onClick={() => router.push('/writer')}
          className="p-2 -ml-2 text-[var(--muted)] hover:text-[var(--text)] rounded-md transition"
          title="Go back"
        >
          <ArrowLeft size={20} />
        </button>
      </div>
      
      <div className="flex items-center gap-4">
        <button 
          onClick={onSave}
          className="flex items-center gap-1.5 text-sm font-medium text-[var(--text)] hover:text-[var(--muted)] transition-colors"
        >
          {saveState === "Saving" ? "Saving..." : saveState === "Saved" ? "Saved" : saveState === "Sync Pending" ? "Sync Pending" : "Save"}
        </button>

        <button type="button" 
          onClick={() => setShowMeta(!showMeta)}
          className={`p-2 rounded-md transition ${showMeta ? 'bg-[var(--surface)] text-[var(--text)]' : 'text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface)]'}`}
          title="Toggle Metadata"
        >
          <Info size={18} />
        </button>

        <button type="button" 
          onClick={() => setConfirmDialog({ isOpen: true, action: 'publish' })}
          className="px-4 py-1.5 bg-[var(--text)] text-[var(--background)] text-sm font-semibold rounded-md hover:opacity-90 transition active:scale-95"
        >
          Publish
        </button>
        
        {/* Hidden mobile menu for extra actions, or show on desktop */}
        <div className="hidden md:flex items-center gap-1 ml-2 pl-4 border-l border-[var(--border)]">
          <button type="button" onClick={handleCopy} className="p-2 text-[var(--muted)] hover:text-[var(--text)] rounded-md transition" title="Copy Content">
            <Copy size={18} />
          </button>
          <button type="button" onClick={() => setConfirmDialog({ isOpen: true, action: 'clear' })} className="p-2 text-[var(--muted)] hover:text-[var(--text)] rounded-md transition" title="Clear Editor">
            <RotateCcw size={18} />
          </button>
          <button type="button" onClick={() => setConfirmDialog({ isOpen: true, action: 'delete' })} className="p-2 text-[var(--muted)] hover:text-red-500 rounded-md transition" title="Delete Draft">
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    </header>
  );
}

