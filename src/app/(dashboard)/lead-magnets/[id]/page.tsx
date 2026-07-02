"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";
import { LeadMagnetService } from "@/services/LeadMagnetService";
import { ContentService } from "@/services/ContentService";
import { UniversalContent } from "@/lib/db";
import { ArrowLeft, Trash2, Save } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import Link from "next/link";
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';

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

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Write your lead magnet content here...',
      }),
      CharacterCount,
    ],
    content: '',
    editorProps: {
      attributes: {
        class: 'prose prose-stone dark:prose-invert max-w-none focus:outline-none min-h-[400px]',
      },
    },
    onUpdate: () => {
      // We could auto-save, but we'll add a save button for manual saves
    }
  });

  useEffect(() => {
    const loadLeadMagnet = async () => {
      if (!workspaceId) return;
      const id = params.id as string;
      const lm = await ContentService.getById(id);
      
      if (lm && lm.type === 'LEAD_MAGNET') {
        setLeadMagnet(lm);
        setEditingTitle(lm.title);
        setEditingDesc(lm.description || "");
        if (editor && !editor.isDestroyed) {
          // If body is empty or null, set empty string.
          // In a real app we parse the JSON AST, but for simplicity here we assume HTML or JSON
          // The Writer uses JSON AST, so we might need to handle it.
          if (lm.body && typeof lm.body === 'object' && Object.keys(lm.body).length > 0) {
            editor.commands.setContent(lm.body as Parameters<typeof editor.commands.setContent>[0]);
          }
        }
      }
      setIsLoading(false);
    };
    if (editor) {
      loadLeadMagnet();
    }
  }, [params.id, workspaceId, editor]);

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
    if (!leadMagnet || !editor) return;
    setIsSaving(true);
    const json = editor.getJSON();
    await LeadMagnetService.update(leadMagnet.id, { body: json });
    toast('Lead Magnet saved', 'success');
    setIsSaving(false);
  };

  const handleDelete = async () => {
    if (leadMagnet) {
      await LeadMagnetService.delete(leadMagnet.id);
      await refreshData();
      toast('Lead Magnet deleted', 'success');
      router.push('/lead-magnets');
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-8 space-y-8">
        <LoadingSkeleton variant="text" className="h-10 w-48 mb-2" />
        <LoadingSkeleton variant="page" />
      </div>
    );
  }

  if (!leadMagnet) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center py-24">
        <h1 className="text-2xl font-semibold mb-2">Lead Magnet not found</h1>
        <p className="text-[var(--muted)] mb-6">This lead magnet may have been deleted or you don&apos;t have access.</p>
        <Link href="/lead-magnets" className="text-blue-500 hover:underline">Return to Lead Magnets</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8 animate-fade-in">
      <header className="flex flex-col md:flex-row justify-between items-start gap-4">
        <div className="flex items-start gap-3 w-full">
          <button type="button" 
            onClick={() => router.push('/lead-magnets')}
            className="p-2 -ml-2 text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface)] rounded-md transition mt-1"
            aria-label="Back to lead magnets"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex flex-col flex-1 gap-2">
            <input
              aria-label="Lead magnet title"
              type="text"
              value={editingTitle}
              onChange={(e) => setEditingTitle(e.target.value)}
              onBlur={handleSaveMeta}
              onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
              className="text-3xl font-semibold tracking-tight bg-transparent border-none outline-none focus:ring-0 w-full p-0 m-0"
              placeholder="Lead Magnet Title"
            />
            <input
              aria-label="Lead magnet description"
              type="text"
              value={editingDesc}
              onChange={(e) => setEditingDesc(e.target.value)}
              onBlur={handleSaveMeta}
              onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
              className="text-base bg-transparent border-none outline-none focus:ring-0 w-full p-0 m-0 text-[var(--muted)]"
              placeholder="Add a description..."
            />
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button type="button" 
            onClick={handleSaveContent}
            disabled={isSaving}
            className="flex items-center gap-2 bg-[var(--surface)] border border-[var(--border)] px-4 py-2 rounded-lg font-medium hover:bg-[var(--background)] transition active:scale-95 shadow-sm"
          >
            <Save size={16} />
            {isSaving ? 'Saving...' : 'Save'}
          </button>
          <button type="button" 
            onClick={() => setIsDeleting(true)}
            className="p-2 text-red-400 hover:text-red-500 hover:bg-red-500/10 rounded-md transition border border-[var(--border)]"
            title="Delete"
            aria-label="Delete lead magnet"
          >
            <Trash2 size={20} />
          </button>
        </div>
      </header>

      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 shadow-sm">
        <EditorContent editor={editor} />
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
