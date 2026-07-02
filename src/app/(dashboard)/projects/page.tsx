"use client";

import { useAppStore } from "@/store/useAppStore";
import { Plus, Pin, PinOff, MoreVertical } from "lucide-react";
import Link from "next/link";

export default function ProjectsPage() {
  const { projects } = useAppStore();

  return (
    <div className="max-w-6xl mx-auto p-8 space-y-8">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Projects</h1>
          <p className="text-[var(--muted)] mt-1">Manage your active campaigns, products, and ongoing work.</p>
        </div>
        <button className="flex items-center gap-2 bg-[var(--text)] text-[var(--background)] px-4 py-2 rounded-lg font-medium hover:opacity-90 transition">
          <Plus size={18} />
          New Project
        </button>
      </header>

      {projects.length === 0 ? (
        <div className="border border-[var(--border)] border-dashed rounded-2xl p-12 text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-[var(--surface)] border border-[var(--border)] rounded-full flex items-center justify-center mb-4">
            <Plus size={24} className="text-[var(--muted)]" />
          </div>
          <h2 className="text-xl font-semibold mb-2">No projects yet</h2>
          <p className="text-[var(--muted)] max-w-sm mb-6">Create a project to organize your content, ideas, and tasks around a specific goal.</p>
          <button className="bg-[var(--surface)] text-[var(--text)] border border-[var(--border)] px-4 py-2 rounded-lg font-medium hover:border-[var(--text)] transition">
            Create First Project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map(project => (
            <div key={project.id} className="group bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 hover:border-[var(--text)] transition relative flex flex-col h-full">
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 bg-[var(--background)] rounded-lg flex items-center justify-center text-xl border border-[var(--border)]">
                  📁
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-1.5 text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--background)] rounded-md transition">
                    {project.isPinned ? <PinOff size={16} /> : <Pin size={16} />}
                  </button>
                  <button className="p-1.5 text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--background)] rounded-md transition">
                    <MoreVertical size={16} />
                  </button>
                </div>
              </div>
              
              <Link href={`/projects/${project.id}`} className="block mb-2 font-medium text-lg hover:underline decoration-[var(--muted)] underline-offset-4">
                {project.title}
              </Link>
              
              <p className="text-sm text-[var(--muted)] flex-1 line-clamp-2 mb-4">
                {project.description || "No description provided."}
              </p>
              
              <div className="flex justify-between items-center text-xs text-[var(--muted)] border-t border-[var(--border)] pt-4 mt-auto">
                <span>Updated {new Date(project.updatedAt).toLocaleDateString()}</span>
                <span className="bg-[var(--background)] px-2 py-1 rounded border border-[var(--border)]">
                  0 Items
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
