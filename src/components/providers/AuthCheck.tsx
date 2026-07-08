"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";
import { createClient } from "@/lib/supabase/client";
import { SyncEngine } from "@/lib/syncEngine";
import { Loader2 } from "lucide-react";

export function AuthCheck({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { loadInitialData } = useAppStore();
  
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    const isPublicRoute = pathname.startsWith('/login') || pathname.startsWith('/signup') || pathname.startsWith('/auth/callback');
    
    if (isPublicRoute) {
      setTimeout(() => setIsChecking(false), 0);
      return;
    }

    const checkSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error || !session) {
        if (typeof navigator !== 'undefined' && !navigator.onLine) {
           import('@/lib/db').then(async ({ db }) => {
             const workspaces = await db.workspaces.toArray();
             if (workspaces.length > 0) {
               console.warn('Offline and session expired, but local data exists. Allowing offline access.');
               setIsAuthenticated(true);
               const store = useAppStore.getState();
               if (store.isLoading && !store.workspaceId) {
                 await loadInitialData();
               }
               setIsChecking(false);
               return;
             }
             setIsAuthenticated(false);
             setIsChecking(false);
             router.push('/login');
           });
           return;
        }

        setIsAuthenticated(false);
        setIsChecking(false);
        router.push('/login');
        return;
      }

      setIsAuthenticated(true);
      const store = useAppStore.getState();
      if (store.isLoading && !store.workspaceId) {
        await loadInitialData();
        SyncEngine.startSync();
      }
      setIsChecking(false);
    };

    checkSession();
  }, [pathname, loadInitialData, router]);

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

  const isPublicRoute = pathname.startsWith('/login') || pathname.startsWith('/signup') || pathname.startsWith('/auth/callback');
  
  if (!isPublicRoute && isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#121212]">
        <Loader2 className="w-8 h-8 animate-spin text-black dark:text-white" />
      </div>
    );
  }

  if (!isPublicRoute && !isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  return <>{children}</>;
}
