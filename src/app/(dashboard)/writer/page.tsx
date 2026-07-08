"use client";

import { useEffect, useEffectEvent, useState, useCallback, Suspense, useMemo } from "react";
import { Plus, FolderOpen, Calendar as CalendarIcon, MoreVertical, FileText, Search, Copy, Trash2 } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { Editor } from "@/components/features/Editor";
import { UniversalContent, ContentStatus } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";
import { ContentService } from "@/services/ContentService";
import { useRouter, useSearchParams } from "next/navigation";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ui/Toast";
import { format } from "date-fns";

const DEFAULT_AST = {
  type: "doc",
  content: [
    {
      type: "paragraph",
    }
  ]
};

import { WriterMetaPanel } from "@/components/features/writer/WriterMetaPanel";
import { WriterHeader } from "@/components/features/writer/WriterHeader";
import { SearchInput } from "@/components/ui/SearchInput";

function WriterList() {
  const router = useRouter();
  const { drafts, projects } = useAppStore();
  const { toast } = useToast();
  const [filter, setFilter] = useState<'all' | 'independent' | 'project' | 'calendar'>('all');
  const [searchQuery, setSearchQuery] = useState("");

  const handleDuplicate = async (e: React.MouseEvent, draft: UniversalContent) => {
    e.stopPropagation();
    await ContentService.duplicate(draft.id);
    toast('Draft duplicated', 'success');
  };

  const handleDelete = async (e: React.MouseEvent, draft: UniversalContent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this draft?')) {
      await ContentService.moveToTrash(draft.id);
      toast('Draft deleted');
    }
  };

  const filteredDrafts = useMemo(() => {
    return drafts.filter(draft => {
      if (searchQuery && !draft.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      
      if (filter === 'independent') {
        return !draft.projectId && !draft.scheduledFor;
      }
      if (filter === 'project') {
        return !!draft.projectId;
      }
      if (filter === 'calendar') {
        return !!draft.scheduledFor;
      }
      return true;
    });
  }, [drafts, filter, searchQuery]);

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8 animate-fade-in">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-[var(--text)]">Writer</h1>
          <p className="text-[var(--muted)] mt-2 text-lg">Create, edit, and organize your content.</p>
        </div>
        <button
          onClick={() => router.push('/writer?new=true')}
          className="flex items-center justify-center gap-2 bg-[var(--text)] text-[var(--background)] px-4 py-2 rounded-lg font-medium hover:opacity-90 transition shadow-sm active:scale-95"
        >
          <Plus size={18} />
          New Draft
        </button>
      </header>

      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-[var(--surface)] p-2 rounded-xl border border-[var(--border)] shadow-sm">
        <div className="w-full sm:max-w-md px-2">
          <SearchInput 
            value={searchQuery}
            onChange={(val) => setSearchQuery(val)}
            placeholder="Search drafts..."
          />
        </div>
        <div className="flex items-center gap-1 bg-[var(--background)] p-1 rounded-lg border border-[var(--border)] w-full sm:w-auto">
          {["all", "independent", "project", "calendar"].map((mode) => (
            <button 
              key={mode}
              onClick={() => setFilter(mode as "all" | "independent" | "project" | "calendar")}
              className={`flex-1 sm:flex-none px-4 py-2 text-sm font-medium rounded-md transition capitalize ${
                filter === mode 
                  ? "bg-[var(--text)] text-[var(--background)] shadow-sm" 
                  : "text-[var(--muted)] hover:text-[var(--text)]"
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {filteredDrafts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center border border-[var(--border)] border-dashed rounded-2xl bg-[var(--surface)]/50">
          <div className="w-16 h-16 bg-[var(--background)] border border-[var(--border)] rounded-2xl flex items-center justify-center mb-6 text-[var(--text)] shadow-sm">
            <FileText size={32} />
          </div>
          <h3 className="text-xl font-semibold mb-2">Write your first post</h3>
          <p className="text-[var(--muted)] max-w-sm mb-6">Start a new draft to begin writing. Your content library will appear here.</p>
          <button
            onClick={() => router.push('/writer?new=true')}
            className="flex items-center justify-center gap-2 bg-[var(--background)] border border-[var(--border)] text-[var(--text)] px-4 py-2 rounded-lg font-medium hover:border-[var(--text)] transition shadow-sm"
          >
            <Plus size={18} />
            Start a new draft
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDrafts.map(draft => {
            const project = projects.find(p => p.id === draft.projectId);
            return (
              <div 
                key={draft.id} 
                onClick={() => router.push(`/writer?id=${draft.id}`)}
                className="group flex flex-col p-5 bg-[var(--surface)] border border-[var(--border)] rounded-2xl hover:border-[var(--text)] hover:shadow-sm transition-all cursor-pointer relative"
              >
                <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                  <button 
                    onClick={(e) => handleDuplicate(e, draft)}
                    className="p-1.5 bg-[var(--background)] hover:bg-[var(--surface)] rounded-md text-[var(--muted)] hover:text-[var(--text)] border border-[var(--border)] shadow-sm"
                    title="Duplicate"
                  >
                    <Copy size={14} />
                  </button>
                  <button 
                    onClick={(e) => handleDelete(e, draft)}
                    className="p-1.5 bg-[var(--background)] hover:bg-red-500/10 rounded-md text-[var(--muted)] hover:text-red-500 border border-[var(--border)] shadow-sm"
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-blue-500 pr-16 transition-colors">
                  {draft.title || "Untitled Draft"}
                </h3>
                <p className="text-sm text-[var(--muted)] mt-2 line-clamp-2 min-h-[40px]">
                  {draft.cta || "No CTA specified..."}
                </p>
                
                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-[var(--border)]">
                  {draft.projectId ? (
                    <div className="flex items-center gap-1.5 text-xs font-medium text-[var(--text)] bg-[var(--background)] border border-[var(--border)] px-2 py-1 rounded-md">
                      <FolderOpen size={12} className="text-blue-500" />
                      {project?.title || "Project"}
                    </div>
                  ) : draft.scheduledFor ? (
                    <div className="flex items-center gap-1.5 text-xs font-medium text-[var(--text)] bg-[var(--background)] border border-[var(--border)] px-2 py-1 rounded-md">
                      <CalendarIcon size={12} className="text-green-500" />
                      {format(new Date(draft.scheduledFor), 'MMM d, yyyy')}
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-xs font-medium text-[var(--muted)]">
                      Independent
                    </div>
                  )}
                  
                  <div className="flex-1" />
                  <span className="text-xs text-[var(--muted)] capitalize">{draft.status}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function WriterContent({ draftId, initialDate, initialProjectId }: { draftId?: string | null; initialDate?: string | null; initialProjectId?: string | null }) {
  const router = useRouter();
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
  
  const [saveTo, setSaveTo] = useState<'independent' | 'project' | 'calendar'>('independent');
  const [pillarInput, setPillarInput] = useState("");
  
  // Dialogs
  const [confirmDialog, setConfirmDialog] = useState<{isOpen: boolean, action: 'delete' | 'clear' | 'publish' | null}>({isOpen: false, action: null});

  useEffect(() => {
    if (draftId) {
      ContentService.getById(draftId).then((existing) => {
        if (existing) {
          setDocument(existing);
          if (existing.scheduledFor) {
            setSaveTo('calendar');
          } else if (existing.projectId) {
            setSaveTo('project');
          } else {
            setSaveTo('independent');
          }
        }
      }).catch((error: unknown) => console.error("Failed to load draft", error));
    } else if (initialDate) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDocument(prev => ({ ...prev, scheduledFor: initialDate, status: 'scheduled' }));
      setSaveTo('calendar');
    } else if (initialProjectId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDocument(prev => ({ ...prev, projectId: initialProjectId }));
      setSaveTo('project');
    }
  }, [draftId, initialDate, initialProjectId]);

  const isEmpty = (doc: Partial<UniversalContent>) => {
    const hasTitle = doc.title && doc.title.trim().length > 0;
    const hasCta = doc.cta && doc.cta.trim().length > 0;
    
    // Check if body is just the empty default AST
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const bodyContent = doc.body as any;
    let hasBodyText = false;
    if (bodyContent && bodyContent.content) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      hasBodyText = bodyContent.content.some((node: any) => {
        if (node.type === 'paragraph' && (!node.content || node.content.length === 0)) return false;
        if (node.content && Array.isArray(node.content)) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          return node.content.some((child: any) => child.text && child.text.trim().length > 0);
        }
        return false;
      });
    }
    
    return !hasTitle && !hasCta && !hasBodyText;
  };

  const saveDocument = useCallback(async (docToSave: Partial<UniversalContent>, force: boolean = false) => {
    if (isEmpty(docToSave)) {
      if (force) toast('Write something before saving.', 'error');
      return;
    }
    
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
  }, [isOffline, refreshData, workspaceId, toast]);

  const saveDocumentEvent = useEffectEvent(saveDocument);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!isEmpty(document)) {
        saveDocumentEvent(document);
      }
    }, 1500);
    return () => clearTimeout(timeout);
  }, [document]);

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
        // e.preventDefault();
        // setConfirmDialog({ isOpen: true, action: 'delete' });
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

  const handleCopy = () => {
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
    router.push('/writer');
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
      <div className={`flex-1 flex flex-col transition-all duration-300 ${showMeta ? 'mr-80' : ''}`}>
        
        <WriterHeader
          document={document}
          isOffline={isOffline}
          saveState={saveState}
          showMeta={showMeta}
          setShowMeta={setShowMeta}
          handleCopy={handleCopy}
          handleDuplicate={handleDuplicate}
          setConfirmDialog={setConfirmDialog}
          onSave={async () => {
            await saveDocument(document, true);
            toast('Draft saved', 'success');
          }}
        />

        <main className="flex-1 overflow-y-auto px-4 sm:px-8 md:px-24 lg:px-48 py-8 md:py-16 custom-scrollbar">
          <div className="max-w-3xl mx-auto space-y-6 pb-32">
            
            <div className="flex items-stretch gap-4">
              <div className="w-1 bg-white/20 rounded-full shrink-0 my-1" />
              <input
                aria-label="Post title"
                type="text"
                placeholder="Post title..."
                value={document.title}
                onChange={(e) => setDocument({ ...document, title: e.target.value })}
                className="w-full text-4xl md:text-5xl font-bold bg-transparent border-none outline-none text-[var(--text)] placeholder:text-[var(--muted)] tracking-tight focus:ring-0 p-0"
              />
            </div>
            
            <div className="h-[1px] w-full bg-[var(--border)]/50 mt-8 mb-4" />
            
            <div className="min-h-[300px]">
              <Editor 
                key={document.id}
                content={document.body || DEFAULT_AST}
                onChange={(body) => setDocument({ ...document, body })}
              />
            </div>

            <div className="h-px w-full bg-[var(--border)] my-6" />

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
  const searchParams = useSearchParams();
  const draftId = searchParams.get('id');
  const isNew = searchParams.get('new') === 'true';
  const initialDate = searchParams.get('date');
  const initialProjectId = searchParams.get('projectId');
  const isEditorMode = !!draftId || isNew;

  return (
    <Suspense fallback={<div className="flex h-[100dvh] items-center justify-center bg-[var(--background)] text-[var(--muted)]">Loading...</div>}>
      {isEditorMode ? <WriterContent draftId={draftId} initialDate={initialDate} initialProjectId={initialProjectId} /> : <WriterList />}
    </Suspense>
  );
}
