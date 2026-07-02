"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

import { useAppStore } from "@/store/useAppStore";

export function AuthCheck({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);
  const { loadInitialData } = useAppStore();

  useEffect(() => {
    // Only check on client side
    const auth = localStorage.getItem("contro_auth");
    
    if (!auth) {
      // If we're already on login/signup/splash, do nothing
      if (!pathname.startsWith('/login') && !pathname.startsWith('/signup') && !pathname.startsWith('/splash')) {
        // Did they see splash? Let's use a flag for that
        const seenSplash = sessionStorage.getItem("contro_seen_splash");
        if (!seenSplash) {
          router.replace('/splash');
        } else {
          router.replace('/login');
        }
      } else {
        setIsChecking(false);
      }
    } else {
      // User is authenticated
      // Start loading data if not on public routes
      if (!pathname.startsWith('/login') && !pathname.startsWith('/signup') && !pathname.startsWith('/splash')) {
        const store = useAppStore.getState();
        if (store.isLoading && !store.workspaceId) {
          loadInitialData();
        }
      }

      if (pathname.startsWith('/login') || pathname.startsWith('/signup') || pathname.startsWith('/splash')) {
        router.replace('/');
      } else {
        setIsChecking(false);
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

  if (isChecking) {
    return <div className="h-screen w-screen bg-[var(--background)]" />; // blank white screen while checking to prevent flash
  }

  return <>{children}</>;
}
