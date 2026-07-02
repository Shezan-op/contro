"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { MoreHorizontal, Cloud, CloudOff, Info, Calendar, FolderOpen, ChevronLeft, ChevronRight, X, ArrowLeft, Copy, Trash2, CopyPlus, RotateCcw, Check } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { Editor } from "@/components/features/Editor";
import { UniversalContent, ContentPlatform, ContentStatus } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";
import { ContentService } from "@/services/ContentService";
import { useRouter, useSearchParams } from "next/navigation";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ui/Toast";

const DEFAULT_AST = {
  type: "doc",
  content: [
    {
      type: "heading",
      attrs: { level: 2 },
      content: [{ type: "text", text: "Introduction" }]
    },
    {
      type: "paragraph",
      content: [{ type: "text", text: "Start your draft here with a strong hook..." }]
    },
    {
      type: "paragraph",
    }
  ]
};

function WriterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { isOffline, refreshData, projects, workspaceId } = useAppStore();
  const [document, setDocument] = useState<Partial<UniversalContent>>({
    id: uuidv4(),
    title: "",
    body: DEFAULT_AST,
    cta: "",
    contentPillars: [],
    platform: null,
    status: 'draft',
    scheduledFor: null,
    projectId: undefined
  });
  const [isLoadingDraft, setIsLoadingDraft] = useState(false);
  
  const [showMeta, setShowMeta] = useState(false);
  const [saveState, setSaveState] = useState<"Unsaved" | "Saving" | "Saved" | "Sync Pending">("Unsaved");
  
  const [saveTo, setSaveTo] = useState<'project' | 'calendar'>('project');
  const [pillarInput, setPillarInput] = useState("");
  
  // Dialogs
  const [confirmDialog, setConfirmDialog] = useState<{isOpen: boolean, action: 'delete' | 'clear' | 'publish' | null}>({isOpen: false, action: null});

  // Load existing draft by ID from URL params
  useEffect(() => {
    const draftId = searchParams.get('id');
    if (draftId) {
      setIsLoadingDraft(true);
      ContentService.getById(draftId).then((existing) => {
        if (existing) {
          setDocument(existing);
          if (existing.scheduledFor) {
            setSaveTo('calendar');
          }
        }
        setIsLoadingDraft(false);
      }).catch(() => setIsLoadingDraft(false));
    }
  }, [searchParams]);

  // Saving function

  const saveDocument = useCallback(async (docToSave: Partial<UniversalContent>, force: boolean = false) => {
    if (!force && docToSave.title === "" && (!docToSave.body || Object.keys(docToSave.body).length === 0)) return;
    
    setSaveState("Saving");
    try {
      const existing = await ContentService.getById(docToSave.id!);
      if (existing) {
        await ContentService.update(docToSave.id!, {
          title: docToSave.title,
          body: docToSave.body,
          cta: docToSave.cta,
          contentPillars: docToSave.contentPillars,
          platform: docToSave.platform,
          status: docToSave.status,
          scheduledFor: docToSave.scheduledFor,
          projectId: docToSave.projectId,
        });
      } else {
        if (!workspaceId) throw new Error("No workspace ID");
        await ContentService.create(workspaceId, 'DRAFT', {
          id: docToSave.id!,
          title: docToSave.title || 'Untitled',
          body: docToSave.body,
          cta: docToSave.cta,
          contentPillars: docToSave.contentPillars || [],
          platform: docToSave.platform || null,
          status: docToSave.status || 'draft',
          scheduledFor: docToSave.scheduledFor || null,
          projectId: docToSave.projectId,
        });
      }
      setSaveState(isOffline ? "Sync Pending" : "Saved");
      refreshData();
    } catch (e) {
      console.error(e);
      setSaveState("Unsaved");
    }
  }, [isOffline, refreshData]);

  // Debounced auto-save
  useEffect(() => {
    const timeout = setTimeout(() => {
      saveDocument(document);
    }, 1500);
    return () => clearTimeout(timeout);
  }, [document, saveDocument]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        saveDocument(document, true);
        toast('Draft saved', 'success');
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'Backspace') {
        e.preventDefault();
        setConfirmDialog({ isOpen: true, action: 'delete' });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [document, saveDocument, toast]);

  const handleAddPillar = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && pillarInput.trim() !== '') {
      if ((document.contentPillars || []).length < 4) {
        setDocument({
          ...document,
          contentPillars: [...(document.contentPillars || []), pillarInput.trim()]
        });
        setPillarInput("");
      }
    }
  };

  const removePillar = (index: number) => {
    const newPillars = [...(document.contentPillars || [])];
    newPillars.splice(index, 1);
    setDocument({ ...document, contentPillars: newPillars });
  };

  const changeDate = (days: number) => {
    const current = document.scheduledFor ? new Date(document.scheduledFor) : new Date();
    current.setDate(current.getDate() + days);
    setDocument({ ...document, scheduledFor: current.toISOString() });
  };

  // Actions
  const handleCopy = () => {
    // In a real app we'd convert TipTap AST to text here. Using title for now.
    navigator.clipboard.writeText(`${document.title}\n\n[Body Content]\n\n${document.cta || ''}`);
    toast('Content copied to clipboard', 'success');
  };

  const handleDuplicate = async () => {
    const newDoc = { ...document, id: uuidv4(), title: `${document.title} (Copy)` };
    setDocument(newDoc);
    await saveDocument(newDoc, true);
    toast('Draft duplicated', 'success');
  };

  const handleClear = () => {
    setDocument({ ...document, title: "", body: DEFAULT_AST, cta: "" });
    setConfirmDialog({ isOpen: false, action: null });
    toast('Editor cleared');
  };

  const handleDelete = async () => {
    if (document.id) {
      await ContentService.moveToTrash(document.id);
      refreshData();
    }
    toast('Draft deleted');
    router.back();
  };

  const handlePublish = async () => {
    const newDoc = { ...document, status: 'published' as ContentStatus };
    setDocument(newDoc);
    await saveDocument(newDoc, true);
    setConfirmDialog({ isOpen: false, action: null });
    toast('Draft published successfully', 'success');
  };

  const isCalendarMode = saveTo === 'calendar';

  return (
    <div className="flex h-[100dvh] bg-[var(--background)] relative animate-fade-in">
      {/* Main Editor Area */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${showMeta ? 'mr-80' : ''}`}>
        
        {/* Top bar */}
        <header className="h-14 flex items-center justify-between px-4 md:px-6 border-b border-[var(--border)] shrink-0">
          <div className="flex items-center gap-3 md:gap-4">
            <button 
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
              <button onClick={handleCopy} className="p-2 text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface)] rounded-md transition" title="Copy Content">
                <Copy size={18} />
              </button>
              <button onClick={handleDuplicate} className="p-2 text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface)] rounded-md transition" title="Duplicate">
                <CopyPlus size={18} />
              </button>
              <button onClick={() => setConfirmDialog({ isOpen: true, action: 'clear' })} className="p-2 text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface)] rounded-md transition" title="Clear Editor">
                <RotateCcw size={18} />
              </button>
              <button onClick={() => setConfirmDialog({ isOpen: true, action: 'delete' })} className="p-2 text-red-400 hover:text-red-500 hover:bg-red-500/10 rounded-md transition" title="Delete Draft (Cmd+Backspace)">
                <Trash2 size={18} />
              </button>
            </div>
            
            <button 
              onClick={() => setShowMeta(!showMeta)}
              className={`p-2 rounded-md transition ${showMeta ? 'bg-[var(--surface)] text-[var(--text)] shadow-sm border border-[var(--border)]' : 'text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface)] border border-transparent'}`}
              title="Toggle Metadata"
            >
              <Info size={18} />
            </button>
            <button 
              onClick={() => setConfirmDialog({ isOpen: true, action: 'publish' })}
              className="ml-1 md:ml-2 px-3 md:px-4 py-1.5 bg-[var(--text)] text-[var(--background)] text-xs md:text-sm font-medium rounded-md hover:opacity-90 transition active:scale-95 shadow-sm"
            >
              Publish
            </button>
          </div>
        </header>

        {/* Editor Canvas */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-8 md:px-24 lg:px-48 py-8 md:py-12 custom-scrollbar">
          <div className="max-w-3xl mx-auto space-y-6 pb-32">
            <input
              type="text"
              placeholder="Post Title..."
              value={document.title}
              onChange={(e) => setDocument({ ...document, title: e.target.value })}
              className="w-full text-3xl md:text-4xl font-semibold bg-transparent border-none outline-none text-[var(--text)] placeholder:text-[var(--muted)] tracking-tight focus:ring-0 p-0"
            />
            
            <hr className="border-[var(--border)] my-6" />
            
            <Editor 
              content={document.body || DEFAULT_AST}
              onChange={(body) => setDocument({ ...document, body })}
            />

            <hr className="border-[var(--border)] my-6" />

            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wider font-semibold text-[var(--muted)] pl-1">Call to Action</label>
              <textarea
                placeholder="What should the reader do next?"
                value={document.cta || ""}
                onChange={(e) => setDocument({ ...document, cta: e.target.value })}
                className="w-full min-h-[100px] p-4 bg-[var(--surface)] border border-[var(--border)] rounded-xl outline-none text-[var(--text)] placeholder:text-[var(--muted)] focus:border-[var(--text)] transition-colors resize-y shadow-sm"
              />
            </div>
          </div>
        </main>
      </div>

      {/* Meta Panel (Right Sidebar) */}
      <aside 
        className={`w-80 h-full bg-[var(--surface)] border-l border-[var(--border)] absolute right-0 top-0 overflow-y-auto shadow-2xl transition-transform duration-300 z-30 ${showMeta ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-lg">Metadata</h3>
            <button onClick={() => setShowMeta(false)} className="p-1 text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--background)] rounded-md transition">
              <X size={18} />
            </button>
          </div>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--text)]">Save Destination</label>
              <div className="flex bg-[var(--background)] p-1 rounded-lg border border-[var(--border)]">
                <button 
                  onClick={() => setSaveTo('project')}
                  className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-sm font-medium rounded-md transition ${saveTo === 'project' ? 'bg-[var(--surface)] text-[var(--text)] shadow-sm border border-[var(--border)]' : 'text-[var(--muted)] hover:text-[var(--text)]'}`}
                >
                  <FolderOpen size={16} /> Project
                </button>
                <button 
                  onClick={() => {
                    setSaveTo('calendar');
                    if (!document.scheduledFor) {
                      setDocument({ ...document, scheduledFor: new Date().toISOString() });
                    }
                  }}
                  className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-sm font-medium rounded-md transition ${saveTo === 'calendar' ? 'bg-[var(--surface)] text-[var(--text)] shadow-sm border border-[var(--border)]' : 'text-[var(--muted)] hover:text-[var(--text)]'}`}
                >
                  <Calendar size={16} /> Calendar
                </button>
              </div>
            </div>

            {isCalendarMode ? (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[var(--text)]">Schedule Date</label>
                  <div className="flex items-center justify-between bg-[var(--background)] border border-[var(--border)] rounded-lg p-1.5 shadow-sm">
                    <button onClick={() => changeDate(-1)} className="p-1.5 hover:bg-[var(--surface)] rounded-md text-[var(--muted)] hover:text-[var(--text)] transition"><ChevronLeft size={16}/></button>
                    <span className="text-sm font-medium">
                      {document.scheduledFor ? new Date(document.scheduledFor).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }) : 'Select Date'}
                    </span>
                    <button onClick={() => changeDate(1)} className="p-1.5 hover:bg-[var(--surface)] rounded-md text-[var(--muted)] hover:text-[var(--text)] transition"><ChevronRight size={16}/></button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-[var(--text)]">Platform</label>
                  <select 
                    value={document.platform || ""}
                    onChange={(e) => setDocument({ ...document, platform: e.target.value as ContentPlatform })}
                    className="w-full p-2.5 bg-[var(--background)] border border-[var(--border)] rounded-lg text-sm text-[var(--text)] shadow-sm outline-none focus:border-[var(--text)] transition-colors"
                  >
                    <option value="">Select Platform...</option>
                    <option value="LinkedIn">LinkedIn</option>
                    <option value="X (Twitter)">X (Twitter)</option>
                    <option value="Instagram">Instagram</option>
                    <option value="Newsletter">Newsletter</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[var(--text)]">Status</label>
                  <select 
                    value={document.status || "draft"}
                    onChange={(e) => setDocument({ ...document, status: e.target.value as ContentStatus })}
                    className="w-full p-2.5 bg-[var(--background)] border border-[var(--border)] rounded-lg text-sm text-[var(--text)] shadow-sm outline-none focus:border-[var(--text)] transition-colors"
                  >
                    <option value="draft">Draft</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="published">Published</option>
                    <option value="completed">Completed</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>
              </>
            ) : (
              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--text)]">Assigned Project</label>
                <select 
                  value={document.projectId || ""}
                  onChange={(e) => setDocument({ ...document, projectId: e.target.value })}
                  className="w-full p-2.5 bg-[var(--background)] border border-[var(--border)] rounded-lg text-sm text-[var(--text)] shadow-sm outline-none focus:border-[var(--text)] transition-colors"
                >
                  <option value="">No Project</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.title}</option>
                  ))}
                </select>
              </div>
            )}

            <hr className="border-[var(--border)]" />

            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--text)] flex justify-between">
                <span>Content Pillars</span>
                <span className="text-xs text-[var(--muted)]">{(document.contentPillars || []).length}/4</span>
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {(document.contentPillars || []).map((pillar, idx) => (
                  <span key={idx} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[var(--background)] border border-[var(--border)] rounded-full text-xs font-medium shadow-sm">
                    {pillar}
                    <button onClick={() => removePillar(idx)} className="text-[var(--muted)] hover:text-red-500 p-0.5 rounded-full transition-colors">
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
              {(document.contentPillars || []).length < 4 && (
                <input 
                  type="text" 
                  value={pillarInput}
                  onChange={(e) => setPillarInput(e.target.value)}
                  onKeyDown={handleAddPillar}
                  placeholder="Type & press enter..." 
                  className="w-full p-2.5 bg-[var(--background)] border border-[var(--border)] rounded-lg text-sm text-[var(--text)] shadow-sm outline-none focus:border-[var(--text)] transition-colors" 
                />
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* Confirmation Dialogs */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen && confirmDialog.action === 'delete'}
        title="Delete Draft?"
        message="This action cannot be undone. The draft will be permanently removed."
        confirmLabel="Delete"
        isDestructive
        onConfirm={handleDelete}
        onCancel={() => setConfirmDialog({ isOpen: false, action: null })}
      />
      <ConfirmDialog
        isOpen={confirmDialog.isOpen && confirmDialog.action === 'clear'}
        title="Clear Editor?"
        message="This will remove all content in the editor. You cannot undo this."
        confirmLabel="Clear"
        isDestructive
        onConfirm={handleClear}
        onCancel={() => setConfirmDialog({ isOpen: false, action: null })}
      />
      <ConfirmDialog
        isOpen={confirmDialog.isOpen && confirmDialog.action === 'publish'}
        title="Publish Content?"
        message="This will mark the content as published and save it to your workspace."
        confirmLabel="Publish"
        onConfirm={handlePublish}
        onCancel={() => setConfirmDialog({ isOpen: false, action: null })}
      />
    </div>
  );
}

export default function WriterPage() {
  return (
    <Suspense fallback={<div className="flex h-[100dvh] items-center justify-center bg-[var(--background)] text-[var(--muted)]">Loading...</div>}>
      <WriterContent />
    </Suspense>
  );
}
