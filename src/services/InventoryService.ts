import { v4 as uuidv4 } from 'uuid';
import { db, InventoryLibrary, InventoryItem } from '../lib/db';

export class InventoryService {
  /**
   * Initialize default libraries if none exist for the workspace
   */
  static async initializeDefaults(workspaceId: string) {
    const existing = await db.inventoryLibraries
      .where('workspaceId')
      .equals(workspaceId)
      .count();

    if (existing === 0) {
      const defaults = ['Hooks', 'Ideas', 'CTAs', 'Offers', 'DM Scripts', 'Documentation'];
      const libraries: InventoryLibrary[] = defaults.map((name, index) => ({
        id: uuidv4(),
        workspaceId,
        name,
        order: index,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        syncStatus: 'pending'
      }));
      await db.inventoryLibraries.bulkAdd(libraries);
    }
  }

  // --- Libraries ---

  static async getLibraries(workspaceId: string): Promise<InventoryLibrary[]> {
    return await db.inventoryLibraries
      .where('workspaceId')
      .equals(workspaceId)
      .filter(l => l.syncStatus !== 'pending_delete')
      .sortBy('order');
  }

  static async createLibrary(workspaceId: string, name: string): Promise<InventoryLibrary> {
    const libraries = await this.getLibraries(workspaceId);
    const maxOrder = libraries.length > 0 ? Math.max(...libraries.map(l => l.order)) : -1;
    
    const newLibrary: InventoryLibrary = {
      id: uuidv4(),
      workspaceId,
      name,
      order: maxOrder + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      syncStatus: 'pending'
    };
    
    await db.inventoryLibraries.add(newLibrary);
    return newLibrary;
  }

  static async updateLibrary(id: string, updates: Partial<InventoryLibrary>): Promise<void> {
    await db.inventoryLibraries.update(id, {
      ...updates,
      updatedAt: new Date().toISOString(),
      syncStatus: 'pending'
    });
  }

  static async deleteLibrary(id: string): Promise<void> {
    // Use tombstone deletion for sync
    await db.transaction('rw', db.inventoryLibraries, db.inventoryItems, async () => {
      await db.inventoryLibraries.update(id, {
        syncStatus: 'pending_delete',
        deletedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      const items = await db.inventoryItems.where('libraryId').equals(id).toArray();
      for (const item of items) {
        await db.inventoryItems.update(item.id, {
          syncStatus: 'pending_delete',
          deletedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }
    });
  }

  static async getLibraryCounts(workspaceId: string): Promise<Record<string, number>> {
    const items = await db.inventoryItems
      .where('workspaceId')
      .equals(workspaceId)
      .filter(i => i.syncStatus !== 'pending_delete')
      .toArray();
    return items.reduce((acc, item) => {
      acc[item.libraryId] = (acc[item.libraryId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  // --- Items ---

  static async getItems(libraryId: string): Promise<InventoryItem[]> {
    return await db.inventoryItems
      .where('libraryId')
      .equals(libraryId)
      .filter(i => i.syncStatus !== 'pending_delete')
      .sortBy('order');
  }

  static async addItem(workspaceId: string, libraryId: string, text: string = ""): Promise<InventoryItem> {
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
      syncStatus: 'pending'
    };
    
    await db.inventoryItems.add(newItem);
    return newItem;
  }

  static async updateItem(id: string, title?: string, url?: string, text?: string): Promise<void> {
    const updates: Partial<InventoryItem> = {};
    if (title !== undefined) updates.title = title;
    if (url !== undefined) updates.url = url;
    if (text !== undefined) updates.text = text;
    
    updates.updatedAt = new Date().toISOString();
    updates.syncStatus = 'pending';
    
    await db.inventoryItems.update(id, updates);
  }

  static async deleteItem(id: string): Promise<void> {
    await db.inventoryItems.update(id, {
      syncStatus: 'pending_delete',
      deletedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }

  static async bulkImport(workspaceId: string, libraryId: string, texts: string[]): Promise<void> {
    const items = await this.getItems(libraryId);
    const maxOrder = items.length > 0 ? Math.max(...items.map(i => i.order)) : -1;
    
    const newItems: InventoryItem[] = texts.map((text, index) => ({
      id: uuidv4(),
      workspaceId,
      libraryId,
      text,
      order: maxOrder + 1 + index,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      syncStatus: 'pending'
    }));
    
    await db.inventoryItems.bulkAdd(newItems);
  }

  static async searchItems(workspaceId: string, query: string): Promise<(InventoryItem & { libraryName: string })[]> {
    const q = query.toLowerCase();
    if (!q) return [];
    
    const [items, libraries] = await Promise.all([
      db.inventoryItems.where('workspaceId').equals(workspaceId).filter(i => i.syncStatus !== 'pending_delete').toArray(),
      this.getLibraries(workspaceId)
    ]);
    const libMap = Object.fromEntries(libraries.map(l => [l.id, l.name]));

    return items.reduce<(InventoryItem & { libraryName: string })[]>((matches, item) => {
      const matchText = item.text?.toLowerCase().includes(q);
      const matchTitle = item.title?.toLowerCase().includes(q);
      const matchUrl = item.url?.toLowerCase().includes(q);
      
      if (matchText || matchTitle || matchUrl) {
        matches.push({ ...item, libraryName: libMap[item.libraryId] || 'Unknown' });
      }
      return matches;
    }, []);
  }
}
