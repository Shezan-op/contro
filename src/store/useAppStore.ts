import { create } from 'zustand';
import { UniversalContent } from '@/lib/db';
import { ContentService } from '@/services/ContentService';
import { ProjectService } from '@/services/ProjectService';
import { TaskService } from '@/services/TaskService';

interface AppState {
  projects: UniversalContent[];
  items: UniversalContent[];
  tasks: UniversalContent[];
  isOffline: boolean;
  isLoading: boolean;
  loadInitialData: () => Promise<void>;
  setOfflineStatus: (status: boolean) => void;
  // Basic actions for UI to use
  refreshData: () => Promise<void>;
}

export const useAppStore = create<AppState>((set) => ({
  projects: [],
  items: [],
  tasks: [],
  isOffline: false,
  isLoading: true,
  
  loadInitialData: async () => {
    set({ isLoading: true });
    try {
      const projects = await ProjectService.getAll();
      const tasks = await TaskService.getActive();
      const drafts = await ContentService.getByType('DRAFT');
      // For now, load drafts as main items in inventory
      
      set({ projects, items: drafts, tasks, isLoading: false });
    } catch (error) {
      console.error("Failed to load local data", error);
      set({ isLoading: false });
    }
  },

  refreshData: async () => {
    try {
      const projects = await ProjectService.getAll();
      const tasks = await TaskService.getActive();
      const drafts = await ContentService.getByType('DRAFT');
      set({ projects, items: drafts, tasks });
    } catch (error) {
      console.error("Failed to refresh local data", error);
    }
  },
  
  setOfflineStatus: (status: boolean) => {
    set({ isOffline: status });
  }
}));
