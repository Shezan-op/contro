import { useRouter } from "next/navigation";
import { ArrowLeft, Cloud, CloudOff, Copy, CopyPlus, RotateCcw, Trash2, Info, Check } from "lucide-react";
import { UniversalContent } from "@/lib/db";

interface WriterHeaderProps {
  document: Partial<UniversalContent>;
  isOffline: boolean;
  saveState: "Unsaved" | "Saving" | "Saved" | "Sync Pending";
  showMeta: boolean;
  setShowMeta: (show: boolean) => void;
  handleCopy: () => void;
  handleDuplicate: () => void;
  setConfirmDialog: (dialog: { isOpen: boolean; action: 'delete' | 'clear' | 'publish' | null }) => void;
}

export function WriterHeader({
  document,
  isOffline,
  saveState,
  showMeta,
  setShowMeta,
  handleCopy,
  handleDuplicate,
  setConfirmDialog,
}: WriterHeaderProps) {
  const router = useRouter();

  return (
    <header className="h-14 flex items-center justify-between px-4 md:px-6 border-b border-[var(--border)] shrink-0">
      <div className="flex items-center gap-3 md:gap-4">
        <button type="button" 
          onClick={() => router.back()}
          className="p-1.5 md:p-2 -ml-2 text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface)] rounded-md transition"
          title="Go back"
        >
          <ArrowLeft size={18} />
        </button>
        <span className="text-xs md:text-sm font-medium px-2 py-1 bg-[var(--surface)] border border-[var(--border)] rounded text-[var(--muted)]">
          {document.status === 'scheduled' ? 'Scheduled' : document.status === 'published' ? 'Published' : 'Draft'}
        </span>
        <div className="flex items-center gap-1.5 text-xs md:text-sm text-[var(--muted)] transition-colors">
          {isOffline ? (
            <><CloudOff size={14} /> <span className="hidden md:inline">Offline</span></>
          ) : (
            <>
              {saveState === 'Saving' ? <Cloud size={14} className="animate-pulse text-[var(--text)]" /> : 
               saveState === 'Saved' ? <Check size={14} className="text-green-500" /> : 
               <Cloud size={14} />} 
              <span className={`hidden md:inline ${saveState === 'Saving' ? 'text-[var(--text)]' : ''}`}>{saveState}</span>
            </>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-1 md:gap-2">
        <div className="hidden md:flex items-center gap-1 mr-2 pr-2 border-r border-[var(--border)]">
          <button type="button" onClick={handleCopy} className="p-2 text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface)] rounded-md transition" title="Copy Content">
            <Copy size={18} />
          </button>
          <button type="button" onClick={handleDuplicate} className="p-2 text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface)] rounded-md transition" title="Duplicate">
            <CopyPlus size={18} />
          </button>
          <button type="button" onClick={() => setConfirmDialog({ isOpen: true, action: 'clear' })} className="p-2 text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface)] rounded-md transition" title="Clear Editor">
            <RotateCcw size={18} />
          </button>
          <button type="button" onClick={() => setConfirmDialog({ isOpen: true, action: 'delete' })} className="p-2 text-red-400 hover:text-red-500 hover:bg-red-500/10 rounded-md transition" title="Delete Draft (Cmd+Backspace)">
            <Trash2 size={18} />
          </button>
        </div>
        
        <button type="button" 
          onClick={() => setShowMeta(!showMeta)}
          className={`p-2 rounded-md transition ${showMeta ? 'bg-[var(--surface)] text-[var(--text)] shadow-sm border border-[var(--border)]' : 'text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface)] border border-transparent'}`}
          title="Toggle Metadata"
        >
          <Info size={18} />
        </button>
        <button type="button" 
          onClick={() => setConfirmDialog({ isOpen: true, action: 'publish' })}
          className="ml-1 md:ml-2 px-3 md:px-4 py-1.5 bg-[var(--text)] text-[var(--background)] text-xs md:text-sm font-medium rounded-md hover:opacity-90 transition active:scale-95 shadow-sm"
        >
          Publish
        </button>
      </div>
    </header>
  );
}
