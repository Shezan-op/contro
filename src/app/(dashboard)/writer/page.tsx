"use client";

import { useEffect, useEffectEvent, useState, useCallback, Suspense, type Dispatch, type SetStateAction } from "react";
import { Cloud, CloudOff, Info, Calendar, FolderOpen, ChevronLeft, ChevronRight, X, ArrowLeft, Copy, Trash2, CopyPlus, RotateCcw, Check } from "lucide-react";
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

import { WriterMetaPanel } from "@/components/features/writer/WriterMetaPanel";
import { WriterHeader } from "@/components/features/writer/WriterHeader";

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
      ContentService.getById(draftId).then((existing) => {
        if (existing) {
          setDocument(existing);
          if (existing.scheduledFor) {
            setSaveTo('calendar');
          }
        }
      }).catch((error: any) => console.error("Failed to load draft", error));
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
  }, [isOffline, refreshData, workspaceId]);

  const saveDocumentEvent = useEffectEvent(saveDocument);

  // Debounced auto-save
  useEffect(() => {
    const timeout = setTimeout(() => {
      saveDocumentEvent(document);
    }, 1500);
    return () => clearTimeout(timeout);
  }, [document]);

  // Keyboard shortcuts
  const handleShortcutSave = useEffectEvent(async () => {
    await saveDocument(document, true);
    toast('Draft saved', 'success');
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        void handleShortcutSave();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'Backspace') {
        e.preventDefault();
        setConfirmDialog({ isOpen: true, action: 'delete' });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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

  return (
    <div className="flex h-[100dvh] bg-[var(--background)] relative animate-fade-in">
      {/* Main Editor Area */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${showMeta ? 'mr-80' : ''}`}>
        
        {/* Top bar */}
        <WriterHeader
          document={document}
          isOffline={isOffline}
          saveState={saveState}
          showMeta={showMeta}
          setShowMeta={setShowMeta}
          handleCopy={handleCopy}
          handleDuplicate={handleDuplicate}
          setConfirmDialog={setConfirmDialog}
        />

        {/* Editor Canvas */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-8 md:px-24 lg:px-48 py-8 md:py-12 custom-scrollbar">
          <div className="max-w-3xl mx-auto space-y-6 pb-32">
            <input
              aria-label="Post title"
              type="text"
              placeholder="Post Title..."
              value={document.title}
              onChange={(e) => setDocument({ ...document, title: e.target.value })}
              className="w-full text-3xl md:text-4xl font-semibold bg-transparent border-none outline-none text-[var(--text)] placeholder:text-[var(--muted)] tracking-tight focus:ring-0 p-0"
            />
            
            <hr className="border-[var(--border)] my-6" />
            
            <Editor 
              key={document.id}
              content={document.body || DEFAULT_AST}
              onChange={(body) => setDocument({ ...document, body })}
            />

            <hr className="border-[var(--border)] my-6" />

            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wider font-semibold text-[var(--muted)] pl-1" htmlFor="writer-cta">Call to Action</label>
              <textarea
                id="writer-cta"
                placeholder="What should the reader do next?"
                value={document.cta || ""}
                onChange={(e) => setDocument({ ...document, cta: e.target.value })}
                className="w-full min-h-[100px] p-4 bg-[var(--surface)] border border-[var(--border)] rounded-xl outline-none text-[var(--text)] placeholder:text-[var(--muted)] focus:border-[var(--text)] transition-colors resize-y shadow-sm"
              />
            </div>
          </div>
        </main>
      </div>

      <WriterMetaPanel
        showMeta={showMeta}
        setShowMeta={setShowMeta}
        document={document}
        setDocument={setDocument}
        saveTo={saveTo}
        setSaveTo={setSaveTo}
        projects={projects}
        pillarInput={pillarInput}
        setPillarInput={setPillarInput}
        handleAddPillar={handleAddPillar}
        removePillar={removePillar}
        changeDate={changeDate}
      />

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
