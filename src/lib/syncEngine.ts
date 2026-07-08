import { createClient } from '@/lib/supabase/client';
import { db, UniversalContent } from '@/lib/db';
import { useAppStore } from '@/store/useAppStore';
import type { Database, Json } from '@/lib/database.types';
import { RealtimeChannel } from '@supabase/supabase-js';

const supabase = createClient();

type Tables = Database['public']['Tables'];

export class SyncEngine {
  private static isSyncing = false;
  private static activeChannel: RealtimeChannel | null = null;

  static async startSync() {
    if (typeof window === 'undefined') return;
    
    useAppStore.getState().setSyncState('syncing');

    // Order: 1. Pull latest metadata & merge (handling conflict detection), 2. Push safe changes
    await this.pullAllChanges();
    await this.pushPendingChanges();

    useAppStore.getState().setSyncState('synced');

    // Setup Realtime Subscriptions without leaking
    if (!this.activeChannel) {
      this.activeChannel = supabase.channel('custom-all-channel');
      this.activeChannel
        .on(
          'postgres_changes',
          { event: '*', schema: 'public' },
          async (payload) => {
            useAppStore.getState().setSyncState('syncing');
            await this.handleRemoteChange(payload);
            useAppStore.getState().setSyncState('synced');
          }
        )
        .subscribe();
    }
      
    // Handle reconnects
    window.addEventListener('online', async () => {
      useAppStore.getState().setOfflineStatus(false);
      useAppStore.getState().setSyncState('syncing');
      await this.pullAllChanges();
      await this.pushPendingChanges();
      useAppStore.getState().setSyncState('synced');
    });

    window.addEventListener('offline', () => {
      useAppStore.getState().setOfflineStatus(true);
    });
    
    // Interval for safety
    setInterval(async () => {
      if (navigator.onLine && !this.isSyncing) {
        useAppStore.getState().setSyncState('syncing');
        await this.pullAllChanges();
        await this.pushPendingChanges();
        useAppStore.getState().setSyncState('synced');
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

  static async pullAllChanges() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const tables: (keyof Tables)[] = ['workspaces', 'inventory_libraries', 'inventory', 'projects', 'content_items', 'tasks', 'lead_magnets', 'user_settings'];
      
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
      useAppStore.getState().setSyncState('failed');
    }
  }

  static async pushPendingChanges() {
    if (this.isSyncing) return;
    this.isSyncing = true;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Note: Because we pulled first, any local pending item where the remote was newer
      // has already been marked as 'conflict' by mergeRemoteItem. 
      // Thus, we only push rows that are strictly 'pending' and safe to overwrite the cloud.

      // 1. Process Workspaces
      const pendingWorkspaces = await db.workspaces.where('syncStatus').equals('pending').toArray();
      for (const item of pendingWorkspaces) {
        const res = await supabase.from('workspaces').upsert({
          id: item.id,
          user_id: user.id,
          name: item.name,
          "isPersonal": item.isPersonal,
          updated_at: item.updatedAt,
          created_at: item.createdAt,
          deleted_at: item.deletedAt || null
        });
        if (!res.error) await db.workspaces.update(item.id, { syncStatus: 'synced' });
      }

      // 2. Process Settings
      const pendingSettings = await db.settings.where('syncStatus').equals('pending').toArray();
      for (const item of pendingSettings) {
        const res = await supabase.from('user_settings').upsert({
          id: item.id,
          user_id: user.id,
          "workspaceId": item.workspaceId,
          theme: item.theme,
          "offlineMode": item.offlineMode,
          "syncEnabled": item.syncEnabled,
          updated_at: item.updatedAt,
          created_at: item.createdAt,
          deleted_at: item.deletedAt || null
        });
        if (!res.error) await db.settings.update(item.id, { syncStatus: 'synced' });
      }

      // 3. Process Content Items
      const pendingContent = await db.content.where('syncStatus').equals('pending').toArray();
      for (const item of pendingContent) {
        const table = this.getTableName(item.type);
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
          updated_at: dbItem.updatedAt,
          created_at: dbItem.createdAt,
          deleted_at: dbItem.deletedAt || null
        };

        let error = null;

        if (table === 'projects') {
          const res = await supabase.from('projects').upsert({ ...basePayload, description: dbItem.description });
          error = res.error;
        } else if (table === 'tasks') {
          const res = await supabase.from('tasks').upsert({
            ...basePayload,
            "projectId": dbItem.projectId,
            "isCompleted": dbItem.isCompleted,
            "dueDate": dbItem.dueDate,
            priority: dbItem.priority,
            reminder: dbItem.reminder,
            "isRepeating": dbItem.isRepeating,
          });
          error = res.error;
        } else if (table === 'lead_magnets') {
          const res = await supabase.from('lead_magnets').upsert({
            ...basePayload,
            description: dbItem.description,
            "assetUrl": dbItem.assetUrl,
            "assetType": dbItem.assetType,
          });
          error = res.error;
        } else {
          const res = await supabase.from('content_items').upsert({
            ...basePayload,
            "projectId": dbItem.projectId,
            body: (dbItem.body as unknown) as Json,
            cta: dbItem.cta,
            "scheduledFor": dbItem.scheduledFor,
          });
          error = res.error;
        }
        
        if (!error) {
          await db.content.update(item.id, { syncStatus: 'synced' });
        } else {
          console.error("Failed to push content", error);
        }
      }

      // 4. Process Inventory Libraries
      const pendingLibraries = await db.inventoryLibraries.where('syncStatus').equals('pending').toArray();
      for (const lib of pendingLibraries) {
        const res = await supabase.from('inventory_libraries').upsert({
          id: lib.id,
          user_id: user.id,
          "workspaceId": lib.workspaceId,
          name: lib.name,
          order: lib.order,
          icon: lib.icon,
          updated_at: lib.updatedAt,
          created_at: lib.createdAt,
          deleted_at: lib.deletedAt || null
        });
        if (!res.error) await db.inventoryLibraries.update(lib.id, { syncStatus: 'synced' });
      }

      // 5. Process Inventory Items
      const pendingInvItems = await db.inventoryItems.where('syncStatus').equals('pending').toArray();
      for (const item of pendingInvItems) {
        const res = await supabase.from('inventory').upsert({
          id: item.id,
          user_id: user.id,
          "workspaceId": item.workspaceId,
          "libraryId": item.libraryId,
          text: item.text,
          order: item.order,
          updated_at: item.updatedAt,
          created_at: item.createdAt,
          deleted_at: item.deletedAt || null
        });
        if (!res.error) await db.inventoryItems.update(item.id, { syncStatus: 'synced' });
      }

    } catch (e) {
      console.error("Push error", e);
      useAppStore.getState().setSyncState('failed');
    } finally {
      this.isSyncing = false;
    }
  }

  static async handleRemoteChange(payload: Record<string, unknown>) {
    // With soft-delete, Supabase hard DELETEs should be extremely rare, but we handle them just in case.
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
      } else if (table === 'user_settings') {
        await db.settings.delete(oldId);
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
    
    // Conflict Detection Logic Function
    const handleConflict = async <T extends { updatedAt?: string; syncStatus?: string }>(local: T | undefined): Promise<boolean> => {
      if (!local) return false; // Safe to merge
      
      if (local.syncStatus === 'pending') {
        if (new Date(remoteUpdatedAt) > new Date(local.updatedAt || 0)) {
          // Cloud has newer data than our offline pending changes. We are in a conflict.
          // Rule: mark as conflict, preserve local data, do NOT overwrite local yet. 
          // Future UI will resolve.
          return true;
        } else {
          // Local is newer. Keep local pending. Ignore cloud pull.
          return true;
        }
      }
      // If local is synced, it's safe to overwrite if remote is newer or equal
      return new Date(remoteUpdatedAt) < new Date(local.updatedAt || 0);
    };

    if (table === 'workspaces') {
      const local = await db.workspaces.get(remoteId);
      const isConflict = await handleConflict(local);
      
      if (!isConflict && (!local || new Date(remoteUpdatedAt) >= new Date(local.updatedAt))) {
        await db.workspaces.put({
          id: remoteId,
          name: remote.name as string,
          isPersonal: remote.isPersonal as boolean,
          createdAt: remote.created_at as string || new Date().toISOString(),
          updatedAt: remoteUpdatedAt,
          deletedAt: remote.deleted_at as string | undefined,
          syncStatus: 'synced'
        });
      } else if (local && local.syncStatus === 'pending' && new Date(remoteUpdatedAt) > new Date(local.updatedAt)) {
        await db.workspaces.update(remoteId, { syncStatus: 'conflict' });
      }
      return;
    }

    if (table === 'user_settings') {
      const local = await db.settings.get(remoteId);
      const isConflict = await handleConflict(local);
      
      if (!isConflict && (!local || new Date(remoteUpdatedAt) >= new Date(local.updatedAt || 0))) {
        await db.settings.put({
          id: remoteId,
          workspaceId: remote.workspaceId as string,
          theme: (remote.theme as 'light'|'dark'|'system') || 'system',
          offlineMode: remote.offlineMode as boolean,
          syncEnabled: remote.syncEnabled as boolean,
          createdAt: remote.created_at as string || new Date().toISOString(),
          updatedAt: remoteUpdatedAt,
          deletedAt: remote.deleted_at as string | undefined,
          syncStatus: 'synced'
        });
      } else if (local && local.syncStatus === 'pending' && new Date(remoteUpdatedAt) > new Date(local.updatedAt || 0)) {
        await db.settings.update(remoteId, { syncStatus: 'conflict' });
      }
      return;
    }

    if (table === 'inventory_libraries') {
      const local = await db.inventoryLibraries.get(remoteId);
      const isConflict = await handleConflict(local);
      
      if (!isConflict && (!local || new Date(remoteUpdatedAt) >= new Date(local.updatedAt || 0))) {
        await db.inventoryLibraries.put({
          id: remoteId,
          workspaceId: remote.workspaceId as string,
          name: remote.name as string,
          order: remote.order as number,
          icon: remote.icon as string,
          createdAt: remote.created_at as string || new Date().toISOString(),
          updatedAt: remoteUpdatedAt,
          deletedAt: remote.deleted_at as string | undefined,
          syncStatus: 'synced'
        });
      } else if (local && local.syncStatus === 'pending' && new Date(remoteUpdatedAt) > new Date(local.updatedAt || 0)) {
        await db.inventoryLibraries.update(remoteId, { syncStatus: 'conflict' });
      }
      return;
    }

    if (table === 'inventory') {
      const local = await db.inventoryItems.get(remoteId);
      const isConflict = await handleConflict(local);
      
      if (!isConflict && (!local || new Date(remoteUpdatedAt) >= new Date(local.updatedAt || 0))) {
        await db.inventoryItems.put({
          id: remoteId,
          workspaceId: remote.workspaceId as string,
          libraryId: remote.libraryId as string,
          text: remote.text as string,
          order: remote.order as number,
          createdAt: remote.created_at as string || new Date().toISOString(),
          updatedAt: remoteUpdatedAt,
          deletedAt: remote.deleted_at as string | undefined,
          syncStatus: 'synced'
        });
      } else if (local && local.syncStatus === 'pending' && new Date(remoteUpdatedAt) > new Date(local.updatedAt || 0)) {
        await db.inventoryItems.update(remoteId, { syncStatus: 'conflict' });
      }
      return;
    }

    const local = await db.content.get(remoteId);
    const isConflict = await handleConflict(local);

    if (isConflict) {
      if (local && local.syncStatus === 'pending' && new Date(remoteUpdatedAt) > new Date(local.updatedAt || 0)) {
        await db.content.update(remoteId, { syncStatus: 'conflict' });
      }
      return;
    }

    if (local && new Date(remoteUpdatedAt) < new Date(local.updatedAt || 0)) {
      return; // local is newer (but not pending, which is weird, but we respect local if newer)
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
      deletedAt: remote.deleted_at as string | undefined,
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
