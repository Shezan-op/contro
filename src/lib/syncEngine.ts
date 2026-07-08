import { createClient } from '@/lib/supabase/client';
import { db, UniversalContent } from '@/lib/db';
import { useAppStore } from '@/store/useAppStore';
import type { Database, Json } from '@/lib/database.types';

const supabase = createClient();

type Tables = Database['public']['Tables'];

export class SyncEngine {
  private static isSyncing = false;

  static async startSync() {
    if (typeof window === 'undefined') return;
    
    // Initial Push of pending local changes
    await this.pushPendingChanges();

    // Initial Pull
    await this.pullAllChanges();

    // Setup Realtime Subscriptions
    supabase.channel('custom-all-channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public' },
        (payload) => {
          this.handleRemoteChange(payload);
        }
      )
      .subscribe();
      
    // Handle reconnects
    window.addEventListener('online', () => {
      useAppStore.getState().setOfflineStatus(false);
      this.pushPendingChanges();
      this.pullAllChanges();
    });

    window.addEventListener('offline', () => {
      useAppStore.getState().setOfflineStatus(true);
    });
    
    // Interval for safety
    setInterval(() => {
      if (navigator.onLine) {
        this.pushPendingChanges();
      }
    }, 15000); // 15 seconds
  }

  static getTableName(type: string): keyof Tables {
    switch (type) {
      case 'PROJECT': return 'projects';
      case 'TASK': return 'tasks';
      case 'LEAD_MAGNET': return 'lead_magnets';
      case 'DRAFT':
      case 'ASSET':
      default: return 'content_items';
    }
  }

  static async pushPendingChanges() {
    if (this.isSyncing) return;
    this.isSyncing = true;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 1. Process Content Items
      const pendingContent = await db.content.where('syncStatus').anyOf(['pending', 'pending_delete']).toArray();
      
      for (const item of pendingContent) {
        const table = this.getTableName(item.type);
        if (item.syncStatus === 'pending_delete') {
          const res = await supabase.from(table).delete().eq('id', item.id);
          if (!res.error) await db.content.delete(item.id);
          continue;
        }

        const { ...dbItem } = item;
        const basePayload = {
          id: dbItem.id,
          user_id: user.id,
          "workspaceId": dbItem.workspaceId,
          title: dbItem.title,
          status: dbItem.status,
          platform: dbItem.platform,
          "contentPillars": dbItem.contentPillars,
          "isStarred": dbItem.isStarred,
          "isArchived": dbItem.isArchived,
          "isTrashed": dbItem.isTrashed,
          updated_at: dbItem.updatedAt || new Date().toISOString(),
          created_at: dbItem.createdAt || new Date().toISOString()
        };

        let error = null;

        if (table === 'projects') {
          const payload = {
            ...basePayload,
            description: dbItem.description,
          };
          const res = await supabase.from('projects').upsert(payload);
          error = res.error;
        } else if (table === 'tasks') {
          const payload = {
            ...basePayload,
            "projectId": dbItem.projectId,
            "isCompleted": dbItem.isCompleted,
            "dueDate": dbItem.dueDate,
            priority: dbItem.priority,
            reminder: dbItem.reminder,
            "isRepeating": dbItem.isRepeating,
          };
          const res = await supabase.from('tasks').upsert(payload);
          error = res.error;
        } else if (table === 'lead_magnets') {
          const payload = {
            ...basePayload,
            description: dbItem.description,
            "assetUrl": dbItem.assetUrl,
            "assetType": dbItem.assetType,
          };
          const res = await supabase.from('lead_magnets').upsert(payload);
          error = res.error;
        } else {
          const payload = {
            ...basePayload,
            "projectId": dbItem.projectId,
            body: (dbItem.body as unknown) as Json,
            cta: dbItem.cta,
            "scheduledFor": dbItem.scheduledFor,
          };
          const res = await supabase.from('content_items').upsert(payload);
          error = res.error;
        }
        
        if (!error) {
          await db.content.update(item.id, { syncStatus: 'synced' });
        } else {
          console.error("Failed to push content", error);
        }
      }

      // 2. Process Inventory Libraries
      const pendingLibraries = await db.inventoryLibraries.where('syncStatus').anyOf(['pending', 'pending_delete']).toArray();
      for (const lib of pendingLibraries) {
        if (lib.syncStatus === 'pending_delete') {
          const res = await supabase.from('inventory_libraries').delete().eq('id', lib.id);
          if (!res.error) await db.inventoryLibraries.delete(lib.id);
          continue;
        }
        
        const payload = {
          id: lib.id,
          user_id: user.id,
          "workspaceId": lib.workspaceId,
          name: lib.name,
          order: lib.order,
          icon: lib.icon,
          updated_at: lib.updatedAt || new Date().toISOString(),
          created_at: lib.createdAt || new Date().toISOString()
        };
        const res = await supabase.from('inventory_libraries').upsert(payload);
        if (!res.error) {
          await db.inventoryLibraries.update(lib.id, { syncStatus: 'synced' });
        }
      }

      // 3. Process Inventory Items
      const pendingInvItems = await db.inventoryItems.where('syncStatus').anyOf(['pending', 'pending_delete']).toArray();
      for (const item of pendingInvItems) {
        if (item.syncStatus === 'pending_delete') {
          const res = await supabase.from('inventory').delete().eq('id', item.id);
          if (!res.error) await db.inventoryItems.delete(item.id);
          continue;
        }
        
        const payload = {
          id: item.id,
          user_id: user.id,
          "workspaceId": item.workspaceId,
          "libraryId": item.libraryId,
          text: item.text,
          order: item.order,
          updated_at: item.updatedAt || new Date().toISOString(),
          created_at: item.createdAt || new Date().toISOString()
        };
        const res = await supabase.from('inventory').upsert(payload);
        if (!res.error) {
          await db.inventoryItems.update(item.id, { syncStatus: 'synced' });
        }
      }

    } catch (e) {
      console.error("Push error", e);
    } finally {
      this.isSyncing = false;
    }
  }

  static async pullAllChanges() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const tables: (keyof Tables)[] = ['workspaces', 'inventory_libraries', 'inventory', 'projects', 'content_items', 'tasks', 'lead_magnets'];
      
      for (const table of tables) {
        const { data, error } = await supabase.from(table).select('*');
        if (error || !data) continue;

        for (const remote of data) {
          await this.mergeRemoteItem(table, remote);
        }
      }
      
      useAppStore.getState().refreshData();
    } catch (e) {
      console.error("Pull error", e);
    }
  }

  static async handleRemoteChange(payload: Record<string, unknown>) {
    if (payload.eventType === 'DELETE') {
      const oldPayload = payload.old as Record<string, string>;
      const oldId = oldPayload.id;
      
      const table = payload.table as string;
      if (table === 'workspaces') {
        await db.workspaces.delete(oldId);
      } else if (table === 'inventory_libraries') {
        await db.inventoryLibraries.delete(oldId);
      } else if (table === 'inventory') {
        await db.inventoryItems.delete(oldId);
      } else {
        await db.content.delete(oldId);
      }
    } else {
      await this.mergeRemoteItem(payload.table as string, payload.new as Record<string, unknown>);
    }
    useAppStore.getState().refreshData();
  }

  static async mergeRemoteItem(table: keyof Tables | string, remote: Record<string, unknown>) {
    const remoteId = remote.id as string;
    const remoteUpdatedAt = remote.updated_at as string || new Date().toISOString();
    
    if (table === 'workspaces') {
      const local = await db.workspaces.get(remoteId);
      if (!local || new Date(remoteUpdatedAt) > new Date(local.updatedAt)) {
        await db.workspaces.put({
          id: remoteId,
          name: remote.name as string,
          isPersonal: remote.isPersonal as boolean,
          createdAt: remote.created_at as string || new Date().toISOString(),
          updatedAt: remoteUpdatedAt,
          syncStatus: 'synced'
        });
      }
      return;
    }

    if (table === 'inventory_libraries') {
      const local = await db.inventoryLibraries.get(remoteId);
      if (!local || new Date(remoteUpdatedAt) > new Date(local.updatedAt || 0)) {
        await db.inventoryLibraries.put({
          id: remoteId,
          workspaceId: remote.workspaceId as string,
          name: remote.name as string,
          order: remote.order as number,
          icon: remote.icon as string,
          createdAt: remote.created_at as string || new Date().toISOString(),
          updatedAt: remoteUpdatedAt,
          syncStatus: 'synced'
        });
      }
      return;
    }

    if (table === 'inventory') {
      const local = await db.inventoryItems.get(remoteId);
      if (!local || new Date(remoteUpdatedAt) > new Date(local.updatedAt || 0)) {
        await db.inventoryItems.put({
          id: remoteId,
          workspaceId: remote.workspaceId as string,
          libraryId: remote.libraryId as string,
          text: remote.text as string,
          order: remote.order as number,
          createdAt: remote.created_at as string || new Date().toISOString(),
          updatedAt: remoteUpdatedAt,
          syncStatus: 'synced'
        });
      }
      return;
    }

    const local = await db.content.get(remoteId);
    if (local && new Date(local.updatedAt || 0) >= new Date(remoteUpdatedAt) && local.syncStatus !== 'synced') {
      // Local is newer or equal and pending - keep local
      return;
    }
    
    let type: UniversalContent['type'] = 'DRAFT';
    if (table === 'projects') type = 'PROJECT';
    if (table === 'tasks') type = 'TASK';
    if (table === 'lead_magnets') type = 'LEAD_MAGNET';

    const mapped: UniversalContent = {
      id: remote.id as string,
      workspaceId: remote.workspaceId as string,
      type,
      title: remote.title as string,
      status: remote.status as UniversalContent['status'],
      platform: remote.platform as UniversalContent['platform'],
      contentPillars: (remote.contentPillars as string[]) || [],
      isStarred: (remote.isStarred as boolean) || false,
      isArchived: (remote.isArchived as boolean) || false,
      isTrashed: (remote.isTrashed as boolean) || false,
      syncStatus: 'synced',
      scheduledFor: null,
      createdAt: remote.created_at as string || new Date().toISOString(),
      updatedAt: remoteUpdatedAt,
    };

    if (table === 'projects') {
      mapped.description = remote.description as string;
    } else if (table === 'tasks') {
      mapped.projectId = remote.projectId as string;
      mapped.isCompleted = remote.isCompleted as boolean;
      mapped.dueDate = remote.dueDate as string;
      mapped.priority = remote.priority as 'low' | 'medium' | 'high' | 'urgent';
      mapped.reminder = remote.reminder as string;
      mapped.isRepeating = remote.isRepeating as boolean;
    } else if (table === 'lead_magnets') {
      mapped.description = remote.description as string;
      mapped.assetUrl = remote.assetUrl as string;
      mapped.assetType = remote.assetType as string;
    } else {
      mapped.projectId = remote.projectId as string;
      mapped.body = (remote.body as unknown) as Record<string, unknown>;
      mapped.cta = remote.cta as string;
      mapped.scheduledFor = remote.scheduledFor as string;
    }

    await db.content.put(mapped);
  }
}
