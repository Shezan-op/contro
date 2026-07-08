import { v4 as uuidv4 } from 'uuid';
import { InventoryLibrary, InventoryItem } from '../lib/db';
import { useAppStore } from "@/store/useAppStore";
import { createClient } from "@/lib/supabase/client";

export class InventoryService {
  /**
   * Initialize default libraries if none exist for the workspace on Supabase
   */
  static async initializeDefaults(workspaceId: string) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('inventory_libraries')
      .select('id')
      .eq('workspaceId', workspaceId)
      .is('deleted_at', null)
      .limit(1);

    if (error) return;

    if (!data || data.length === 0) {
      const defaults = ['Hooks', 'Ideas', 'CTAs', 'Offers', 'DM Scripts', 'Documentation'];
      const libraries = defaults.map((name, index) => ({
        id: uuidv4(),
        user_id: user.id,
        workspaceId,
        name,
        order: index,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));
      
      await supabase.from('inventory_libraries').insert(libraries);
    }
  }

  // --- Libraries ---

  static async getLibraries(workspaceId: string): Promise<InventoryLibrary[]> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('inventory_libraries')
      .select('*')
      .eq('workspaceId', workspaceId)
      .is('deleted_at', null)
      .order('order', { ascending: true });
      
    if (error || !data) return [];
    return data.map(d => ({
      id: d.id,
      workspaceId: d.workspaceId,
      name: d.name,
      order: d.order,
      icon: d.icon,
      createdAt: d.created_at,
      updatedAt: d.updated_at
    }));
  }

  static async createLibrary(workspaceId: string, name: string): Promise<InventoryLibrary> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthenticated");

    const libraries = await this.getLibraries(workspaceId);
    const maxOrder = libraries.length > 0 ? Math.max(...libraries.map(l => l.order)) : -1;
    
    const newLibrary: InventoryLibrary = {
      id: uuidv4(),
      workspaceId,
      name,
      order: maxOrder + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    useAppStore.getState().setLoadingState('Saving...');
    const { error } = await supabase.from('inventory_libraries').insert({
      id: newLibrary.id,
      user_id: user.id,
      workspaceId: newLibrary.workspaceId,
      name: newLibrary.name,
      order: newLibrary.order,
      created_at: newLibrary.createdAt,
      updated_at: newLibrary.updatedAt
    });

    if (error) {
      useAppStore.getState().setLoadingState('Failed to save');
      throw error;
    }
    
    useAppStore.getState().setLoadingState('Saved');
    setTimeout(() => useAppStore.getState().setLoadingState(null), 2000);
    return newLibrary;
  }

  static async updateLibrary(id: string, updates: Partial<InventoryLibrary>): Promise<void> {
    const supabase = createClient();
    useAppStore.getState().setLoadingState('Saving...');

    const payload: any = {
      updated_at: new Date().toISOString()
    };
    if (updates.name !== undefined) payload.name = updates.name;
    if (updates.order !== undefined) payload.order = updates.order;
    if (updates.icon !== undefined) payload.icon = updates.icon;

    const { error } = await supabase.from('inventory_libraries').update(payload).eq('id', id);
    if (error) {
      useAppStore.getState().setLoadingState('Failed to save');
      throw error;
    }
    useAppStore.getState().setLoadingState('Saved');
    setTimeout(() => useAppStore.getState().setLoadingState(null), 2000);
  }

  static async deleteLibrary(id: string): Promise<void> {
    const supabase = createClient();
    useAppStore.getState().setLoadingState('Deleting...');

    const deletedAt = new Date().toISOString();
    
    // Soft delete the library
    await supabase.from('inventory_libraries').update({ deleted_at: deletedAt }).eq('id', id);
    // Soft delete all items inside the library
    await supabase.from('inventory').update({ deleted_at: deletedAt }).eq('libraryId', id);

    useAppStore.getState().setLoadingState(null);
  }

  static async getLibraryCounts(workspaceId: string): Promise<Record<string, number>> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('inventory')
      .select('libraryId')
      .eq('workspaceId', workspaceId)
      .is('deleted_at', null);
      
    if (error || !data) return {};
    
    return data.reduce((acc, item) => {
      acc[item.libraryId] = (acc[item.libraryId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  // --- Items ---

  static async getItems(libraryId: string): Promise<InventoryItem[]> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('inventory')
      .select('*')
      .eq('libraryId', libraryId)
      .is('deleted_at', null)
      .order('order', { ascending: true });
      
    if (error || !data) return [];
    return data.map(d => ({
      id: d.id,
      workspaceId: d.workspaceId,
      libraryId: d.libraryId,
      text: d.text,
      title: d.title || "",
      url: d.url || "",
      order: d.order,
      createdAt: d.created_at,
      updatedAt: d.updated_at
    }));
  }

  static async addItem(workspaceId: string, libraryId: string, text: string = ""): Promise<InventoryItem> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthenticated");

    const items = await this.getItems(libraryId);
    const maxOrder = items.length > 0 ? Math.max(...items.map(i => i.order)) : -1;
    
    const newItem: InventoryItem = {
      id: uuidv4(),
      workspaceId,
      libraryId,
      text,
      title: "",
      url: "",
      order: maxOrder + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    useAppStore.getState().setLoadingState('Saving...');
    const { error } = await supabase.from('inventory').insert({
      id: newItem.id,
      user_id: user.id,
      workspaceId: newItem.workspaceId,
      libraryId: newItem.libraryId,
      text: newItem.text,
      title: newItem.title,
      url: newItem.url,
      order: newItem.order,
      created_at: newItem.createdAt,
      updated_at: newItem.updatedAt
    });

    if (error) {
      useAppStore.getState().setLoadingState('Failed to save');
      throw error;
    }
    
    useAppStore.getState().setLoadingState('Saved');
    setTimeout(() => useAppStore.getState().setLoadingState(null), 2000);
    return newItem;
  }

  static async updateItem(id: string, title?: string, url?: string, text?: string): Promise<void> {
    const supabase = createClient();
    useAppStore.getState().setLoadingState('Saving...');

    const payload: any = {
      updated_at: new Date().toISOString()
    };
    if (title !== undefined) payload.title = title;
    if (url !== undefined) payload.url = url;
    if (text !== undefined) payload.text = text;
    
    const { error } = await supabase.from('inventory').update(payload).eq('id', id);
    if (error) {
      useAppStore.getState().setLoadingState('Failed to save');
      throw error;
    }
    useAppStore.getState().setLoadingState('Saved');
    setTimeout(() => useAppStore.getState().setLoadingState(null), 2000);
  }

  static async deleteItem(id: string): Promise<void> {
    const supabase = createClient();
    useAppStore.getState().setLoadingState('Saving...');
    const { error } = await supabase.from('inventory').update({
      deleted_at: new Date().toISOString()
    }).eq('id', id);
    
    if (error) {
      useAppStore.getState().setLoadingState('Failed to delete');
      throw error;
    }
    useAppStore.getState().setLoadingState(null);
  }

  static async bulkImport(workspaceId: string, libraryId: string, texts: string[]): Promise<void> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthenticated");

    const items = await this.getItems(libraryId);
    const maxOrder = items.length > 0 ? Math.max(...items.map(i => i.order)) : -1;
    
    const newItems = texts.map((text, index) => ({
      id: uuidv4(),
      user_id: user.id,
      workspaceId,
      libraryId,
      text,
      order: maxOrder + 1 + index,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));
    
    useAppStore.getState().setLoadingState('Importing...');
    const { error } = await supabase.from('inventory').insert(newItems);
    if (error) {
      useAppStore.getState().setLoadingState('Failed to import');
      throw error;
    }
    useAppStore.getState().setLoadingState('Saved');
    setTimeout(() => useAppStore.getState().setLoadingState(null), 2000);
  }

  static async searchItems(workspaceId: string, query: string): Promise<(InventoryItem & { libraryName: string })[]> {
    const q = query.toLowerCase();
    if (!q) return [];
    
    const supabase = createClient();
    const { data: items, error: itemsError } = await supabase
      .from('inventory')
      .select('*')
      .eq('workspaceId', workspaceId)
      .is('deleted_at', null);

    const libraries = await this.getLibraries(workspaceId);
    if (itemsError || !items) return [];

    const libMap = Object.fromEntries(libraries.map(l => [l.id, l.name]));

    return items.reduce<(InventoryItem & { libraryName: string })[]>((matches, item) => {
      const matchText = item.text?.toLowerCase().includes(q);
      const matchTitle = item.title?.toLowerCase().includes(q);
      const matchUrl = item.url?.toLowerCase().includes(q);
      
      if (matchText || matchTitle || matchUrl) {
        matches.push({ 
          id: item.id,
          workspaceId: item.workspaceId,
          libraryId: item.libraryId,
          text: item.text,
          title: item.title,
          url: item.url,
          order: item.order,
          createdAt: item.created_at,
          updatedAt: item.updated_at,
          libraryName: libMap[item.libraryId] || 'Unknown' 
        });
      }
      return matches;
    }, []);
  }
}
