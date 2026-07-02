"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

import { useAppStore } from "@/store/useAppStore";
import { readAuthProfile } from "@/lib/localAuth";

export function AuthCheck({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { loadInitialData } = useAppStore();

  useEffect(() => {
    const isPublicRoute = pathname.startsWith('/login') || pathname.startsWith('/signup');
    if (!isPublicRoute && readAuthProfile()) {
      const store = useAppStore.getState();
      if (store.isLoading && !store.workspaceId) {
        loadInitialData();
      }
    }
  }, [pathname, router, loadInitialData]);

  // Global keyboard shortcut: Cmd+K to open search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        router.push('/search');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [router]);

  return <>{children}</>;
}
