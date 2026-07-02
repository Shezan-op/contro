"use client";

export default function TrashPage() {
  return (
    <div className="max-w-6xl mx-auto p-8 space-y-8">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">Trash</h1>
        <p className="text-[var(--muted)] mt-1">Deleted items will be permanently removed after 15 days.</p>
      </header>
      <div className="border border-[var(--border)] border-dashed rounded-2xl p-12 text-center text-[var(--muted)]">
        Trash coming soon.
      </div>
    </div>
  );
}
