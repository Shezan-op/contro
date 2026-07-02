import React, { useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
  shortcut?: string;
}

export function SearchInput({ 
  value, 
  onChange, 
  placeholder = 'Search...', 
  className = '',
  autoFocus = false,
  shortcut
}: SearchInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  useEffect(() => {
    if (!shortcut) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      // Very simple shortcut detection, e.g., 'Cmd+K' or 'Ctrl+K'
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcut]);

  return (
    <div className={`relative ${className}`}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" size={16} />
      <input 
        ref={inputRef}
        aria-label={placeholder}
        type="text" 
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder} 
        className="w-full pl-9 pr-10 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-md text-sm focus:outline-none focus:border-[var(--text)] text-[var(--text)] placeholder:text-[var(--muted)] transition-colors"
      />
      
      {value && (
        <button type="button" 
          onClick={() => onChange('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--text)] transition-colors p-0.5 rounded-sm"
          title="Clear search"
          aria-label="Clear search"
        >
          <X size={14} />
        </button>
      )}
      
      {!value && shortcut && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none opacity-50">
          <kbd className="text-[10px] font-sans border border-[var(--border)] rounded px-1.5 py-0.5 bg-[var(--background)] text-[var(--text)]">⌘</kbd>
          <kbd className="text-[10px] font-sans border border-[var(--border)] rounded px-1.5 py-0.5 bg-[var(--background)] text-[var(--text)]">K</kbd>
        </div>
      )}
    </div>
  );
}
