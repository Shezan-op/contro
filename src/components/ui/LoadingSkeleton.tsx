import React from 'react';

interface LoadingSkeletonProps {
  variant?: 'text' | 'card' | 'list' | 'page';
  className?: string;
}

export function LoadingSkeleton({ variant = 'text', className = '' }: LoadingSkeletonProps) {
  if (variant === 'page') {
    return (
      <div className={`space-y-8 animate-in fade-in duration-500 ${className}`}>
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <div className="h-8 w-48 bg-[var(--border)]/50 rounded-lg animate-shimmer bg-[length:200%_100%] bg-gradient-to-r from-transparent via-[var(--surface)] to-transparent" />
            <div className="h-4 w-64 bg-[var(--border)]/50 rounded-lg animate-shimmer bg-[length:200%_100%] bg-gradient-to-r from-transparent via-[var(--surface)] to-transparent" />
          </div>
          <div className="h-10 w-32 bg-[var(--border)]/50 rounded-lg animate-shimmer bg-[length:200%_100%] bg-gradient-to-r from-transparent via-[var(--surface)] to-transparent" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 bg-[var(--border)]/30 rounded-2xl animate-shimmer bg-[length:200%_100%] bg-gradient-to-r from-transparent via-[var(--surface)] to-transparent" />
          ))}
        </div>
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div className={`h-40 w-full bg-[var(--border)]/30 rounded-2xl animate-shimmer bg-[length:200%_100%] bg-gradient-to-r from-transparent via-[var(--surface)] to-transparent ${className}`} />
    );
  }

  if (variant === 'list') {
    return (
      <div className={`space-y-3 ${className}`}>
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 w-full bg-[var(--border)]/30 rounded-xl animate-shimmer bg-[length:200%_100%] bg-gradient-to-r from-transparent via-[var(--surface)] to-transparent" />
        ))}
      </div>
    );
  }

  return (
    <div className={`h-4 w-full bg-[var(--border)]/50 rounded animate-shimmer bg-[length:200%_100%] bg-gradient-to-r from-transparent via-[var(--surface)] to-transparent ${className}`} />
  );
}
