import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ChevronDown, Folder, Calendar, FileText, Info, Copy, CopyPlus, Trash2, RotateCcw } from "lucide-react";
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
  onSave?: () => void;
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
  onSave
}: WriterHeaderProps) {
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    window.document.addEventListener("mousedown", handleClickOutside);
    return () => window.document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSaveOption = (option: 'project' | 'calendar' | 'independent') => {
    setIsDropdownOpen(false);
    // In a real implementation, this would trigger opening the meta panel 
    // with the specific option selected, or save directly if already set.
    setShowMeta(true);
    if (onSave) onSave();
  };

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
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-1.5 text-sm font-medium text-[var(--text)] hover:text-[var(--muted)] transition-colors"
          >
            Save
            <ChevronDown size={16} className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>
          
          {isDropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-[#1A1A1A] border border-[var(--border)] rounded-xl shadow-2xl overflow-hidden z-50 py-1 animate-fade-in">
              <button 
                onClick={() => handleSaveOption('project')}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-[var(--text)] hover:bg-[var(--surface)] transition-colors text-left"
              >
                <Folder size={16} className="text-[var(--muted)]" />
                Save to project
              </button>
              <button 
                onClick={() => handleSaveOption('calendar')}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-[var(--text)] hover:bg-[var(--surface)] transition-colors text-left border-t border-[var(--border)]/50"
              >
                <Calendar size={16} className="text-[var(--muted)]" />
                Save to calendar
              </button>
              <button 
                onClick={() => handleSaveOption('independent')}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-[var(--text)] hover:bg-[var(--surface)] transition-colors text-left border-t border-[var(--border)]/50"
              >
                <FileText size={16} className="text-[var(--muted)]" />
                Save as independent
              </button>
            </div>
          )}
        </div>

        <button type="button" 
          onClick={() => setShowMeta(!showMeta)}
          className={`p-2 rounded-md transition ${showMeta ? 'bg-[var(--surface)] text-[var(--text)]' : 'text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface)]'}`}
          title="Toggle Metadata"
        >
          <Info size={18} />
        </button>

        <button type="button" 
          onClick={() => setConfirmDialog({ isOpen: true, action: 'publish' })}
          className="px-4 py-1.5 bg-white text-black text-sm font-semibold rounded-md hover:bg-gray-100 transition active:scale-95"
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
