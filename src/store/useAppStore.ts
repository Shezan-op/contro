import { create } from 'zustand';
import { UniversalContent, InventoryLibrary } from '@/lib/db';
import { ContentService } from '@/services/ContentService';
import { ProjectService } from '@/services/ProjectService';
import { TaskService } from '@/services/TaskService';
import { WorkspaceService } from '@/services/WorkspaceService';
import { InventoryService } from '@/services/InventoryService';
import { LeadMagnetService } from '@/services/LeadMagnetService';
import { db } from '@/lib/db';

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
  isOffline: boolean;
  isLoading: boolean;
  theme: Theme;
  error: string | null;
  
  loadInitialData: () => Promise<void>;
  refreshData: () => Promise<void>;
  setOfflineStatus: (status: boolean) => void;
  setTheme: (theme: Theme) => void;
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
  isOffline: false,
  isLoading: true,
  theme: 'system',
  error: null,
  
  loadInitialData: async () => {
    set({ isLoading: true, error: null });
    try {
      const workspace = await WorkspaceService.getDefaultWorkspace();
      const workspaceId = workspace.id;

      // Initialize default inventory libraries if needed
      await InventoryService.initializeDefaults(workspaceId);

      const [
        projects,
        tasks,
        drafts,
        inventoryLibraries,
        inventoryCounts,
        leadMagnets,
        calendarItems
      ] = await Promise.all([
        ProjectService.getAll(workspaceId),
        TaskService.getActive(workspaceId),
        ContentService.getDrafts(workspaceId),
        InventoryService.getLibraries(workspaceId),
        InventoryService.getLibraryCounts(workspaceId),
        LeadMagnetService.getAll(workspaceId),
        db.content
          .where('workspaceId')
          .equals(workspaceId)
          .filter(c => !c.isTrashed && !!c.scheduledFor)
          .toArray()
      ]);
      
      set({ 
        workspaceId,
        projects, 
        drafts, 
        tasks, 
        inventoryLibraries,
        inventoryCounts,
        leadMagnets,
        calendarItems,
        isLoading: false 
      });
    } catch (error) {
      console.error("Failed to load local data", error);
      set({ isLoading: false, error: "Failed to load database. Please try reloading." });
    }
  },

  refreshData: async () => {
    try {
      const workspaceId = get().workspaceId;
      if (!workspaceId) return;

      const [
        projects,
        tasks,
        drafts,
        inventoryLibraries,
        inventoryCounts,
        leadMagnets,
        calendarItems
      ] = await Promise.all([
        ProjectService.getAll(workspaceId),
        TaskService.getActive(workspaceId),
        ContentService.getDrafts(workspaceId),
        InventoryService.getLibraries(workspaceId),
        InventoryService.getLibraryCounts(workspaceId),
        LeadMagnetService.getAll(workspaceId),
        db.content
          .where('workspaceId')
          .equals(workspaceId)
          .filter(c => !c.isTrashed && !!c.scheduledFor)
          .toArray()
      ]);
      
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
      console.error("Failed to refresh local data", error);
    }
  },
  
  setOfflineStatus: (status: boolean) => {
    set({ isOffline: status });
  },

  setTheme: (theme: Theme) => {
    set({ theme });
  }
}));
