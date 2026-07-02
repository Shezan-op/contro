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
  
  loadInitialData: async () => {
    set({ isLoading: true });
    try {
      const workspace = await WorkspaceService.getDefaultWorkspace();
      const workspaceId = workspace.id;

      // Initialize default inventory libraries if needed
      await InventoryService.initializeDefaults(workspaceId);

      const projects = await ProjectService.getAll(workspaceId);
      const tasks = await TaskService.getActive(workspaceId);
      const drafts = await ContentService.getDrafts(workspaceId);
      const inventoryLibraries = await InventoryService.getLibraries(workspaceId);
      const inventoryCounts = await InventoryService.getLibraryCounts(workspaceId);
      const leadMagnets = await LeadMagnetService.getAll(workspaceId);
      
      const calendarItems = await db.content
        .where('workspaceId')
        .equals(workspaceId)
        .filter(c => !c.isTrashed && !!c.scheduledFor)
        .toArray();
      
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
      set({ isLoading: false });
    }
  },

  refreshData: async () => {
    try {
      const workspaceId = get().workspaceId;
      if (!workspaceId) return;

      const projects = await ProjectService.getAll(workspaceId);
      const tasks = await TaskService.getActive(workspaceId);
      const drafts = await ContentService.getDrafts(workspaceId);
      const inventoryLibraries = await InventoryService.getLibraries(workspaceId);
      const inventoryCounts = await InventoryService.getLibraryCounts(workspaceId);
      const leadMagnets = await LeadMagnetService.getAll(workspaceId);
      
      const calendarItems = await db.content
        .where('workspaceId')
        .equals(workspaceId)
        .filter(c => !c.isTrashed && !!c.scheduledFor)
        .toArray();
      
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
