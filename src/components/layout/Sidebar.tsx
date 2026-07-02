"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  PenLine, 
  FolderOpen, 
  BookOpen, 
  CheckSquare, 
  Search,
  Settings,
  User,
  Plus
} from "lucide-react";

const NAV_ITEMS = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Writer", href: "/writer", icon: PenLine },
  { name: "Lead Magnets", href: "/lead-magnets", icon: BookOpen },
  { name: "Inventory", href: "/inventory", icon: FolderOpen },
  { name: "Projects", href: "/projects", icon: FolderOpen },
  { name: "Tasks", href: "/tasks", icon: CheckSquare },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-[var(--border)] bg-[var(--background)] h-screen flex flex-col hidden md:flex">
      <div className="p-6">
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--text)]">Contro</h1>
      </div>
      
      <div className="px-4 pb-4">
        <button className="w-full flex items-center justify-center gap-2 bg-[var(--text)] text-[var(--background)] py-2 rounded-lg font-medium hover:opacity-90 transition">
          <Plus size={18} />
          New Draft
        </button>
      </div>

      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" size={16} />
            <input 
              type="text" 
              placeholder="Search..." 
              className="w-full pl-9 pr-4 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-md text-sm focus:outline-none focus:border-[var(--text)] text-[var(--text)] placeholder:text-[var(--muted)]"
            />
          </div>
        </div>
        
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-md transition text-sm font-medium ${
                isActive 
                  ? "bg-[var(--surface)] border border-[var(--border)] text-[var(--text)]" 
                  : "text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface)] border border-transparent"
              }`}
            >
              <item.icon size={18} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-[var(--border)] space-y-1">
        <Link href="/profile" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface)] rounded-md transition">
          <User size={18} />
          Profile
        </Link>
        <Link href="/settings" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface)] rounded-md transition">
          <Settings size={18} />
          Settings
        </Link>
      </div>
    </aside>
  );
}
