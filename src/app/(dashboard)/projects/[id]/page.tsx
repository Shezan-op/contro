"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";
import { ProjectService } from "@/services/ProjectService";
import { ContentService } from "@/services/ContentService";
import { UniversalContent } from "@/lib/db";
import { ArrowLeft, Trash2, Plus, FileText, Pin } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import Link from "next/link";

export default function ProjectDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { workspaceId, refreshData } = useAppStore();

  const [project, setProject] = useState<UniversalContent | null>(null);
  const [contents, setContents] = useState<UniversalContent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [editingTitle, setEditingTitle] = useState("");
  const [editingDesc, setEditingDesc] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const loadProject = async () => {
      if (!workspaceId) return;
      const id = params.id as string;
      const proj = await ContentService.getById(id);
      
      if (proj && proj.type === 'PROJECT') {
        setProject(proj);
        setEditingTitle(proj.title);
        setEditingDesc(proj.description || "");
        
        const projContents = await ProjectService.getContents(workspaceId, id);
        setContents(projContents);
      }
      setIsLoading(false);
    };
    loadProject();
  }, [params.id, workspaceId]);

  const handleSaveMeta = async () => {
    if (!project) return;
    const title = editingTitle.trim() || "Untitled Project";
    const desc = editingDesc.trim();
    
    if (title !== project.title || desc !== project.description) {
      await ProjectService.rename(project.id, title);
      await ContentService.update(project.id, { description: desc });
      setProject({ ...project, title, description: desc });
      await refreshData();
      toast('Project updated', 'success');
    }
  };

  const handleDelete = async () => {
    if (project) {
      await ProjectService.delete(project.id);
      await refreshData();
      toast('Project deleted', 'success');
      router.push('/projects');
    }
  };

  const handleCreateContent = () => {
    if (!project) return;
    router.push(`/writer?new=true&projectId=${project.id}`);
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-8 space-y-8">
        <LoadingSkeleton variant="text" className="h-10 w-48 mb-2" />
        <LoadingSkeleton variant="page" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center py-24">
        <h1 className="text-2xl font-semibold mb-2">Project not found</h1>
        <p className="text-[var(--muted)] mb-6">This project may have been deleted or you don&apos;t have access.</p>
        <Link href="/projects" className="text-blue-500 hover:underline">Return to Projects</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8 animate-fade-in">
      <header className="flex flex-col md:flex-row justify-between items-start gap-4">
        <div className="flex items-start gap-3 w-full">
          <button type="button" 
            onClick={() => router.push('/projects')}
            className="p-2 -ml-2 text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface)] rounded-md transition mt-1"
            aria-label="Back to projects"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex flex-col flex-1 gap-2">
            <input
              aria-label="Project title"
              type="text"
              value={editingTitle}
              onChange={(e) => setEditingTitle(e.target.value)}
              onBlur={handleSaveMeta}
              onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
              className="text-3xl font-semibold tracking-tight bg-transparent border-none outline-none focus:ring-0 w-full p-0 m-0"
              placeholder="Project Name"
            />
            <input
              aria-label="Project description"
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
            onClick={() => setIsDeleting(true)}
            className="p-2 text-red-400 hover:text-red-500 hover:bg-red-500/10 rounded-md transition"
            title="Delete Project"
            aria-label="Delete project"
          >
            <Trash2 size={20} />
          </button>
        </div>
      </header>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">Content</h2>
          <button type="button" 
            onClick={handleCreateContent}
            className="flex items-center gap-2 bg-[var(--surface)] border border-[var(--border)] text-[var(--text)] px-3 py-1.5 text-sm rounded-lg hover:bg-[var(--background)] transition shadow-sm"
          >
            <Plus size={16} />
            New Content
          </button>
        </div>
        
        {contents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center border border-[var(--border)] border-dashed rounded-2xl">
            <div className="w-12 h-12 bg-[var(--surface)] border border-[var(--border)] rounded-full flex items-center justify-center mb-4 text-[var(--muted)]">
              <FileText size={24} />
            </div>
            <p className="text-[var(--muted)] mb-4">No content in this project yet.</p>
            <button type="button" 
              onClick={handleCreateContent}
              className="flex items-center gap-2 bg-[var(--background)] border border-[var(--border)] text-[var(--text)] px-4 py-2 rounded-lg font-medium hover:bg-[var(--surface)] transition active:scale-95 shadow-sm"
            >
              <Plus size={18} />
              Write Something
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {contents.map((content) => (
              <Link
                key={content.id}
                href={`/writer?id=${content.id}`}
                className="group flex items-center justify-between p-4 bg-[var(--surface)] border border-[var(--border)] rounded-xl hover:border-[var(--text)] hover:shadow-sm transition-all active:scale-[0.99]"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-[var(--background)] border border-[var(--border)] rounded-lg flex items-center justify-center text-[var(--muted)] group-hover:text-[var(--text)] transition-colors">
                    <FileText size={20} />
                  </div>
                  <div>
                    <h3 className="font-medium text-[var(--text)]">{content.title || "Untitled Draft"}</h3>
                    <p className="text-sm text-[var(--muted)] flex items-center gap-2">
                      <span className="capitalize">{content.status}</span>
                      {content.platform && (
                        <>
                          <span>•</span>
                          <span>{content.platform}</span>
                        </>
                      )}
                    </p>
                  </div>
                </div>
                {content.isStarred && <Pin size={16} className="text-[var(--text)] fill-current" />}
              </Link>
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={isDeleting}
        title="Delete Project?"
        message={`Are you sure you want to move "${project.title}" to the trash?`}
        confirmLabel="Move to Trash"
        isDestructive
        onConfirm={handleDelete}
        onCancel={() => setIsDeleting(false)}
      />
    </div>
  );
}
