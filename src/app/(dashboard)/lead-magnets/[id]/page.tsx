"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";
import { LeadMagnetService } from "@/services/LeadMagnetService";
import { ContentService } from "@/services/ContentService";
import { UniversalContent } from "@/lib/db";
import { ArrowLeft, Trash2, Save, Plus, FileText, Menu, X, PanelLeft } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import Link from "next/link";
import { Editor } from "@/components/features/Editor";
import { JSONContent } from "@tiptap/react";
import { motion, AnimatePresence } from "framer-motion";

interface LeadMagnetPage {
  id: string;
  title: string;
  content: JSONContent;
}

export default function LeadMagnetDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { workspaceId, refreshData } = useAppStore();

  const [leadMagnet, setLeadMagnet] = useState<UniversalContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [editingTitle, setEditingTitle] = useState("");
  const [editingDesc, setEditingDesc] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Start sidebar closed on mobile, open on desktop
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Page-by-page state
  const [pages, setPages] = useState<LeadMagnetPage[]>([]);
  const [activePageId, setActivePageId] = useState<string | null>(null);
  const [activePageContent, setActivePageContent] = useState<JSONContent>({ type: "doc", content: [] });

  useEffect(() => {
    let mounted = true;
    if (window.innerWidth >= 768) {
      setTimeout(() => {
        if (mounted) setIsSidebarOpen(true);
      }, 0);
    }
    return () => { mounted = false; };
  }, []);

  const loadLeadMagnet = useCallback(async () => {
    if (!workspaceId) return;
    const id = params.id as string;
    const lm = await ContentService.getById(id);
    
    if (lm && lm.type === 'LEAD_MAGNET') {
      setLeadMagnet(lm);
      setEditingTitle(lm.title);
      setEditingDesc(lm.description || "");
      
      const body = (lm.body as Record<string, unknown>) || {};
      const loadedPages: LeadMagnetPage[] = Array.isArray(body.pages) && body.pages.length > 0 
        ? body.pages 
        : [{ id: crypto.randomUUID(), title: "Chapter 1", content: { type: "doc", content: [] } }];
      
      setPages(loadedPages);
      
      if (!activePageId || !loadedPages.find(p => p.id === activePageId)) {
        setActivePageId(loadedPages[0].id);
        setActivePageContent(loadedPages[0].content);
      }
    }
    setIsLoading(false);
  }, [params.id, workspaceId, activePageId]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      loadLeadMagnet();
    }, 0);
    return () => clearTimeout(timeout);
  }, [loadLeadMagnet]);

  useEffect(() => {
    const activePage = pages.find(p => p.id === activePageId);
    if (activePage) {
      const timeout = setTimeout(() => setActivePageContent(activePage.content), 0);
      return () => clearTimeout(timeout);
    }
  }, [activePageId, pages]);

  const handleEditorChange = (content: JSONContent) => {
    setActivePageContent(content);
    setPages(prev => prev.map(p => p.id === activePageId ? { ...p, content } : p));
  };

  const handleSaveMeta = async () => {
    if (!leadMagnet) return;
    const title = editingTitle.trim() || "Untitled Lead Magnet";
    const desc = editingDesc.trim();
    
    if (title !== leadMagnet.title || desc !== leadMagnet.description) {
      await LeadMagnetService.update(leadMagnet.id, { title, description: desc });
      setLeadMagnet({ ...leadMagnet, title, description: desc });
      await refreshData();
    }
  };

  const handleSaveContent = async () => {
    if (!leadMagnet) return;
    setIsSaving(true);
    
    const updatedPages = pages.map(p => p.id === activePageId ? { ...p, content: activePageContent } : p);
    
    await LeadMagnetService.update(leadMagnet.id, { body: { pages: updatedPages } });
    toast('Lead Magnet saved successfully', 'success');
    setPages(updatedPages);
    setIsSaving(false);
  };

  const savePagesImmediately = async (newPages: LeadMagnetPage[]) => {
    if (!leadMagnet) return;
    setPages(newPages);
    await LeadMagnetService.update(leadMagnet.id, { body: { pages: newPages } });
  };

  const handleDelete = async () => {
    if (leadMagnet) {
      await LeadMagnetService.deletePermanently(leadMagnet.id);
      await refreshData();
      toast('Lead Magnet deleted', 'success');
      router.push('/lead-magnets');
    }
  };

  const handleAddPage = async () => {
    const newPage = { id: crypto.randomUUID(), title: `Chapter ${pages.length + 1}`, content: { type: "doc", content: [] } };
    const newPages = [...pages, newPage];
    await savePagesImmediately(newPages);
    setActivePageId(newPage.id);
    toast('New page added', 'success');
  };

  const handleDeletePage = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (pages.length <= 1) {
      toast('You must have at least one page', 'error');
      return;
    }
    const filtered = pages.filter(p => p.id !== id);
    await savePagesImmediately(filtered);
    if (activePageId === id) {
      setActivePageId(filtered[0].id);
    }
    toast('Page deleted', 'info');
  };

  const handleRenamePage = async (id: string, newTitle: string) => {
    const newPages = pages.map(p => p.id === id ? { ...p, title: newTitle } : p);
    setPages(newPages);
    // Don't auto-save on every keystroke, let handleSaveContent or blur handle it
  };

  const handleRenamePageBlur = async () => {
    if (!leadMagnet) return;
    const updatedPages = pages.map(p => p.id === activePageId ? { ...p, content: activePageContent } : p);
    await LeadMagnetService.update(leadMagnet.id, { body: { pages: updatedPages } });
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto p-8 flex space-x-8">
        <LoadingSkeleton variant="list" className="w-64 shrink-0 hidden md:block" />
        <div className="flex-1 space-y-4">
          <LoadingSkeleton variant="text" className="h-10 w-48 mb-2" />
          <LoadingSkeleton variant="page" />
        </div>
      </div>
    );
  }

  if (!leadMagnet) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center py-24">
        <h1 className="text-2xl font-semibold mb-2">Lead Magnet not found</h1>
        <p className="text-[var(--muted)] mb-6">This lead magnet may have been deleted or you don&apos;t have access.</p>
        <Link href="/lead-magnets" className="text-blue-500 hover:underline font-medium">Return to Lead Magnets</Link>
      </div>
    );
  }

  const activePage = pages.find(p => p.id === activePageId);

  return (
    <div className="h-full flex relative bg-[var(--background)] overflow-hidden">
      
      {/* Mobile Backdrop */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="md:hidden fixed inset-0 bg-black/50 z-20 backdrop-blur-sm"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar - Pages */}
      <AnimatePresence initial={false}>
        {isSidebarOpen && (
          <motion.div 
            initial={{ x: -280, width: 280 }}
            animate={{ x: 0, width: 280 }}
            exit={{ x: -280, width: 280 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="absolute md:relative z-30 h-full border-r border-[var(--border)] bg-[var(--surface)] shrink-0 flex flex-col shadow-2xl md:shadow-none"
          >
            <div className="p-4 border-b border-[var(--border)] flex items-center justify-between">
              <h2 className="font-semibold text-sm tracking-wide text-[var(--muted)] uppercase">Contents</h2>
              <div className="flex items-center gap-1">
                <button 
                  onClick={handleAddPage}
                  className="p-1.5 rounded hover:bg-[var(--background)] text-[var(--text)] transition"
                  title="Add Page"
                >
                  <Plus size={16} />
                </button>
                <button 
                  onClick={() => setIsSidebarOpen(false)}
                  className="p-1.5 rounded hover:bg-[var(--background)] text-[var(--muted)] md:hidden transition"
                  title="Close Sidebar"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
              {pages.map((page) => (
                <div 
                  key={page.id}
                  onClick={() => {
                    setActivePageId(page.id);
                    if (window.innerWidth < 768) setIsSidebarOpen(false);
                  }}
                  className={`group flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
                    activePageId === page.id 
                      ? 'bg-[var(--text)] text-[var(--background)] shadow-sm' 
                      : 'hover:bg-[var(--background)] text-[var(--muted)] hover:text-[var(--text)]'
                  }`}
                >
                  <FileText size={16} className={activePageId === page.id ? 'opacity-80' : 'opacity-50 group-hover:opacity-100'} />
                  <input 
                    type="text" 
                    value={page.title}
                    onChange={(e) => handleRenamePage(page.id, e.target.value)}
                    onBlur={handleRenamePageBlur}
                    className="bg-transparent border-none outline-none flex-1 font-medium text-sm focus:ring-0 p-0"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <button 
                    onClick={(e) => handleDeletePage(page.id, e)}
                    className="p-1 opacity-0 group-hover:opacity-100 hover:text-red-400 transition shrink-0"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Editor Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        <header className="px-4 py-3 md:px-6 md:py-4 border-b border-[var(--border)] flex items-center justify-between bg-[var(--surface)]/50 backdrop-blur-sm z-10 shrink-0">
          <div className="flex items-center gap-2 md:gap-3">
            <button 
              onClick={() => router.push('/lead-magnets')}
              className="p-1.5 md:p-2 -ml-1 md:-ml-2 text-[var(--muted)] hover:text-[var(--text)] rounded-md transition"
              title="Back"
            >
              <ArrowLeft size={20} />
            </button>
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-1.5 md:p-2 text-[var(--muted)] hover:text-[var(--text)] rounded-md transition"
              title="Toggle Sidebar"
            >
              <PanelLeft size={20} />
            </button>
            
            <div className="flex flex-col ml-1 md:ml-2 border-l border-[var(--border)] pl-3 md:pl-4">
              <input
                type="text"
                value={editingTitle}
                onChange={(e) => setEditingTitle(e.target.value)}
                onBlur={handleSaveMeta}
                onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
                className="text-base md:text-lg font-bold tracking-tight bg-transparent border-none outline-none focus:ring-0 p-0 m-0 w-32 md:w-auto"
                placeholder="Lead Magnet Title"
              />
              <input
                type="text"
                value={editingDesc}
                onChange={(e) => setEditingDesc(e.target.value)}
                onBlur={handleSaveMeta}
                onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
                className="text-xs text-[var(--muted)] bg-transparent border-none outline-none focus:ring-0 p-0 m-0 mt-0.5 hidden md:block"
                placeholder="Add a description..."
              />
            </div>
          </div>
          
          <div className="flex items-center gap-1 md:gap-2">
            <button 
              onClick={handleSaveContent}
              disabled={isSaving}
              className="flex items-center justify-center gap-1.5 md:gap-2 bg-[var(--text)] text-[var(--background)] px-3 py-1.5 md:px-4 md:py-2 rounded-lg font-medium hover:opacity-90 transition active:scale-95 shadow-sm disabled:opacity-50 text-sm md:text-base"
            >
              <Save size={16} />
              <span className="hidden sm:inline">{isSaving ? 'Saving...' : 'Save'}</span>
            </button>
            <button 
              onClick={() => setIsDeleting(true)}
              className="p-1.5 md:p-2 text-red-500 hover:text-white hover:bg-red-500 rounded-lg transition"
              title="Delete Lead Magnet"
            >
              <Trash2 size={18} className="md:w-5 md:h-5" />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-12 max-w-4xl mx-auto w-full custom-scrollbar">
          {activePage ? (
            <div className="animate-fade-in" key={activePage.id}>
              <h1 className="text-3xl md:text-4xl font-extrabold text-[var(--text)] mb-6 md:mb-8 tracking-tight">{activePage.title}</h1>
              <div className="prose prose-base md:prose-lg dark:prose-invert max-w-none pb-24">
                <Editor 
                  key={activePage.id}
                  content={activePageContent} 
                  onChange={handleEditorChange} 
                />
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-[var(--muted)]">
              Select a page to start writing
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        isOpen={isDeleting}
        title="Delete Lead Magnet?"
        message={`Are you sure you want to move "${leadMagnet.title}" to the trash?`}
        confirmLabel="Move to Trash"
        isDestructive
        onConfirm={handleDelete}
        onCancel={() => setIsDeleting(false)}
      />
    </div>
  );
}
