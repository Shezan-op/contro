"use client";

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

import { NotificationDropdown } from "./NotificationDropdown";

const NAV_ITEMS = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Writer", href: "/writer", icon: PenLine },
  { name: "Calendar", href: "/calendar", icon: CalendarDays },
  { name: "Lead Magnets", href: "/lead-magnets", icon: BookOpen },
  { name: "Inventory", href: "/inventory", icon: LibraryBig },
  { name: "Projects", href: "/projects", icon: FolderOpen },
  { name: "Tasks", href: "/tasks", icon: CheckSquare },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <aside className="w-64 border-r border-[var(--border)] bg-[var(--background)] h-screen flex flex-col hidden md:flex">
      <div className="p-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--text)]">Contro</h1>
        <NotificationDropdown />
      </div>
      
      <div className="px-4 pb-4">
        <Link href="/writer?new=true" className="w-full flex items-center justify-between bg-[var(--text)] text-[var(--background)] py-2 px-4 rounded-lg font-medium hover:opacity-90 transition active:scale-95">
          <div className="flex items-center gap-2">
            <Plus size={18} />
            New Draft
          </div>
          <kbd className="text-[10px] opacity-70 font-sans">⌘N</kbd>
        </Link>
      </div>

      <nav className="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar">
        <div className="mb-4">
          <SearchInput 
            value="" 
            onChange={() => router.push('/search')} 
            placeholder="Search..."
            shortcut="Cmd+K"
          />
        </div>
        
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.name}
              href={item.href}
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

      <div className="p-4 border-t border-[var(--border)] space-y-1">
        <Link href="/profile" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface)] rounded-md transition group relative">
          {pathname === '/profile' && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-[var(--text)] rounded-r-full" />}
          <User size={18} className="group-hover:scale-110 transition-transform" />
          Profile
        </Link>
        <Link href="/settings" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface)] rounded-md transition group relative">
          {pathname === '/settings' && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-[var(--text)] rounded-r-full" />}
          <Settings size={18} className="group-hover:scale-110 transition-transform" />
          Settings
        </Link>
      </div>
    </aside>
  );
}
