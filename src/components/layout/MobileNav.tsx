"use client";

import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { AnimatePresence, LazyMotion, domAnimation, m } from "framer-motion";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, 
  PenLine, 
  FolderOpen, 
  BookOpen, 
  CheckSquare, 
  Settings,
  User,
  Plus,
  CalendarDays,
  LibraryBig
} from "lucide-react";
import { SearchInput } from "@/components/ui/SearchInput";

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  return (
    <div className="md:hidden flex-none">
      {/* Mobile Header bar */}
      <div className="flex items-center justify-between p-4 border-b border-[var(--border)] bg-[var(--background)]">
        <h1 className="text-xl font-semibold tracking-tight text-[var(--text)]">Contro</h1>
        <button type="button" onClick={() => setIsOpen(true)} className="p-2 -mr-2 text-[var(--text)] rounded-md hover:bg-[var(--surface)] transition active:scale-95">
          <Menu size={24} />
        </button>
      </div>

      {/* Slide-out Drawer */}
      <LazyMotion features={domAnimation}>
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            />
            
            {/* Drawer */}
            <m.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.3 }}
              className="fixed inset-y-0 left-0 z-50 w-64 bg-[var(--background)] shadow-xl flex flex-col"
            >
              <div className="absolute right-4 top-4">
                <button type="button" onClick={() => setIsOpen(false)} className="p-2 text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface)] rounded-md transition active:scale-95">
                  <X size={20} />
                </button>
              </div>
              <div className="flex-1 w-full flex flex-col pt-12 overflow-y-auto">
                <MobileSidebarContent onNavigate={() => setIsOpen(false)} />
              </div>
            </m.div>
          </>
        )}
      </AnimatePresence>
      </LazyMotion>
    </div>
  );
}

const NAV_ITEMS = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Writer", href: "/writer", icon: PenLine },
  { name: "Calendar", href: "/calendar", icon: CalendarDays },
  { name: "Lead Magnets", href: "/lead-magnets", icon: BookOpen },
  { name: "Inventory", href: "/inventory", icon: LibraryBig },
  { name: "Projects", href: "/projects", icon: FolderOpen },
  { name: "Tasks", href: "/tasks", icon: CheckSquare },
];

function MobileSidebarContent({ onNavigate }: { onNavigate: () => void }) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <>
      <div className="px-4 pb-4">
        <Link 
          href="/writer?new=true" 
          onClick={onNavigate}
          className="w-full flex items-center justify-center gap-2 bg-[var(--text)] text-[var(--background)] py-2 rounded-lg font-medium hover:opacity-90 transition active:scale-95"
        >
          <Plus size={18} />
          New Draft
        </Link>
      </div>

      <nav className="flex-1 px-4 space-y-1 custom-scrollbar">
        <div className="mb-4">
          <SearchInput 
            value="" 
            onChange={() => {
              router.push('/search');
              onNavigate();
            }} 
            placeholder="Search..."
          />
        </div>
        
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onNavigate}
              className={`group flex items-center gap-3 px-3 py-2 rounded-md transition text-sm font-medium relative ${
                isActive 
                  ? "bg-[var(--surface)] text-[var(--text)]" 
                  : "text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface)]"
              }`}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-[var(--text)] rounded-r-full" />
              )}
              <item.icon size={18} className={`transition-transform ${isActive ? '' : 'group-hover:scale-110'}`} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 mt-auto border-t border-[var(--border)] space-y-1">
        <Link onClick={onNavigate} href="/profile" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface)] rounded-md transition group relative">
          {pathname === '/profile' && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-[var(--text)] rounded-r-full" />}
          <User size={18} className="group-hover:scale-110 transition-transform" />
          Profile
        </Link>
        <Link onClick={onNavigate} href="/settings" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface)] rounded-md transition group relative">
          {pathname === '/settings' && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-[var(--text)] rounded-r-full" />}
          <Settings size={18} className="group-hover:scale-110 transition-transform" />
          Settings
        </Link>
      </div>
    </>
  );
}
