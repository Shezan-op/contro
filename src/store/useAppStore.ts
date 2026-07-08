import { create } from 'zustand';
import { UniversalContent, InventoryLibrary } from '@/lib/db';
import { ContentService } from '@/services/ContentService';
import { ProjectService } from '@/services/ProjectService';
import { TaskService } from '@/services/TaskService';
import { WorkspaceService } from '@/services/WorkspaceService';
import { InventoryService } from '@/services/InventoryService';
import { LeadMagnetService } from '@/services/LeadMagnetService';
import { createClient } from '@/lib/supabase/client';

type Theme = 'light' | 'dark' | 'system';

interface AppState {
  workspaceId: string | null;
  projects: UniversalContent[];
  drafts: UniversalContent[];
  tasks: UniversalContent[];
  inventoryLibraries: InventoryLibrary[];
  inventoryCounts: Record<string, number>;
  leadMagnets: UniversalContent[];
  calendarItems: UniversalContent[];
  
  isLoading: boolean;
  loadingState: string | null; // e.g., 'Saving...', 'Saved', 'Failed'
  theme: Theme;
  error: string | null;
  
  loadInitialData: () => Promise<void>;
  refreshData: () => Promise<void>;
  setTheme: (theme: Theme) => void;
  setLoadingState: (state: string | null) => void;
  subscribeToRealtime: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  workspaceId: null,
  projects: [],
  drafts: [],
  tasks: [],
  inventoryLibraries: [],
  inventoryCounts: {},
  leadMagnets: [],
  calendarItems: [],
  
  isLoading: true,
  loadingState: null,
  theme: 'system',
  error: null,
  
  loadInitialData: async () => {
    set({ isLoading: true, error: null });
    try {
      const workspace = await WorkspaceService.getDefaultWorkspace();
      const workspaceId = workspace.id;

      await InventoryService.initializeDefaults(workspaceId);

      set({ workspaceId });
      
      await get().refreshData();
      get().subscribeToRealtime();
      
      set({ isLoading: false });
    } catch (error) {
      console.error("Failed to load data", error);
      set({ isLoading: false, error: "Failed to load database. Please try reloading." });
    }
  },

  refreshData: async () => {
    try {
      const workspaceId = get().workspaceId;
      if (!workspaceId) return;

      const supabase = createClient();

      const [
        projects,
        tasks,
        drafts,
        inventoryLibraries,
        inventoryCounts,
        leadMagnets,
        { data: rawCalendarItems }
      ] = await Promise.all([
        ProjectService.getAll(workspaceId),
        TaskService.getActive(workspaceId),
        ContentService.getDrafts(workspaceId),
        InventoryService.getLibraries(workspaceId),
        InventoryService.getLibraryCounts(workspaceId),
        LeadMagnetService.getAll(workspaceId),
        supabase.from('content_items')
          .select('*')
          .eq('workspaceId', workspaceId)
          .is('deleted_at', null)
          .eq('isTrashed', false)
          .not('scheduledFor', 'is', null)
      ]);
      
      const calendarItems = (rawCalendarItems || []).map(r => ({
        id: r.id,
        workspaceId: r.workspaceId,
        type: 'DRAFT' as const,
        title: r.title || '',
        body: r.body,
        cta: r.cta,
        projectId: r.projectId,
        contentPillars: r.contentPillars || [],
        platform: r.platform || null,
        status: r.status || 'draft',
        scheduledFor: r.scheduledFor || null,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
        isStarred: r.isStarred || false,
        isArchived: r.isArchived || false,
        isTrashed: r.isTrashed || false,
      }));

      set({ 
        projects, 
        drafts, 
        tasks,
        inventoryLibraries,
        inventoryCounts,
        leadMagnets,
        calendarItems
      });
    } catch (error) {
      console.error("Failed to refresh data", error);
    }
  },
  
  setTheme: (theme: Theme) => {
    set({ theme });
  },
  
  setLoadingState: (state) => {
    set({ loadingState: state });
  },

  subscribeToRealtime: () => {
    const supabase = createClient();
    
    // Unsubscribe from any existing channels first to avoid duplicates
    supabase.removeAllChannels();

    const channel = supabase.channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public' },
        (payload) => {
          console.log('Realtime update received:', payload);
          // Simple naive refresh on any database change.
          // Since data sizes are MVP level, pulling fresh state maintains perfect sync.
          get().refreshData();
        }
      )
      .subscribe();
      
    // Store channel in case we need it, though supabase.removeAllChannels() handles cleanup.
  }
}));
