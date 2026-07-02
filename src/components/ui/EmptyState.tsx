import React from 'react';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionIcon?: LucideIcon;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionIcon: ActionIcon,
  onAction,
  className = ''
}: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-24 text-center border border-[var(--border)] border-dashed rounded-2xl bg-[var(--surface)]/30 ${className}`}>
      <div className="w-16 h-16 bg-[var(--surface)] border border-[var(--border)] rounded-full flex items-center justify-center mb-4 text-[var(--muted)] shadow-sm">
        <Icon size={32} />
      </div>
      <h2 className="text-xl font-medium mb-2 tracking-tight">{title}</h2>
      <p className="text-[var(--muted)] max-w-md mx-auto mb-6">
        {description}
      </p>
      {actionLabel && onAction && (
        <button 
          onClick={onAction}
          className="flex items-center gap-2 bg-[var(--background)] border border-[var(--border)] text-[var(--text)] px-4 py-2 rounded-lg font-medium hover:bg-[var(--surface)] transition active:scale-95"
        >
          {ActionIcon && <ActionIcon size={18} />}
          {actionLabel}
        </button>
      )}
    </div>
  );
}
