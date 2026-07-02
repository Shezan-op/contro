"use client";

import { useParams } from "next/navigation";

export default function ProjectDetailsPage() {
  const params = useParams();
  
  return (
    <div className="max-w-6xl mx-auto p-8 space-y-8">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">Project Details</h1>
        <p className="text-[var(--muted)] mt-1">Project ID: {params.id}</p>
      </header>
      <div className="border border-[var(--border)] border-dashed rounded-2xl p-12 text-center text-[var(--muted)]">
        Project dashboard coming soon.
      </div>
    </div>
  );
}
