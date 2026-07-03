import { createClient } from '@/lib/supabase/client';
import { db, UniversalContent } from '@/lib/db';
import { useAppStore } from '@/store/useAppStore';
import type { Database, Json } from '@/lib/database.types';

const supabase = createClient();

type Tables = Database['public']['Tables'];

export class SyncEngine {
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
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const pendingContent = await db.content.where('syncStatus').equals('pending').toArray();
      
      for (const item of pendingContent) {
        const table = this.getTableName(item.type);
        const { ...dbItem } = item;
        
        // Base properties shared across all tables
        const basePayload = {
          id: dbItem.id,
          user_id: user.id,
          workspaceId: dbItem.workspaceId,
          title: dbItem.title,
          status: dbItem.status,
          platform: dbItem.platform,
          contentPillars: dbItem.contentPillars,
          isStarred: dbItem.isStarred,
          isArchived: dbItem.isArchived,
          isTrashed: dbItem.isTrashed
        };

        let error = null;

        if (table === 'projects') {
          const payload: Tables['projects']['Insert'] = {
            ...basePayload,
            description: dbItem.description,
          };
          const res = await supabase.from('projects').upsert(payload);
          error = res.error;
        } else if (table === 'tasks') {
          const payload: Tables['tasks']['Insert'] = {
            ...basePayload,
            projectId: dbItem.projectId,
            isCompleted: dbItem.isCompleted,
            dueDate: dbItem.dueDate,
            priority: dbItem.priority,
            reminder: dbItem.reminder,
            isRepeating: dbItem.isRepeating,
          };
          const res = await supabase.from('tasks').upsert(payload);
          error = res.error;
        } else if (table === 'lead_magnets') {
          const payload: Tables['lead_magnets']['Insert'] = {
            ...basePayload,
            description: dbItem.description,
            assetUrl: dbItem.assetUrl,
            assetType: dbItem.assetType,
          };
          const res = await supabase.from('lead_magnets').upsert(payload);
          error = res.error;
        } else {
          const payload: Tables['content_items']['Insert'] = {
            ...basePayload,
            projectId: dbItem.projectId,
            body: (dbItem.body as unknown) as Json,
            cta: dbItem.cta,
            scheduledFor: dbItem.scheduledFor,
          };
          const res = await supabase.from('content_items').upsert(payload);
          error = res.error;
        }
        
        if (!error) {
          await db.content.update(item.id, { syncStatus: 'synced' });
        } else {
          console.error("Failed to push", error);
        }
      }
    } catch (e) {
      console.error("Push error", e);
    }
  }

  static async pullAllChanges() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const tables: (keyof Tables)[] = ['projects', 'content_items', 'tasks', 'lead_magnets'];
      
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
      const local = await db.content.get(oldId);
      // Local data always wins against deletion if it has pending changes
      if (local && local.syncStatus === 'pending') {
        console.warn("Conflict detected for deletion of", oldId, "Keeping local changes.");
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
    const local = await db.content.get(remoteId);
    
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

    if (!local) {
      await db.content.put(mapped);
    } else if (local.syncStatus === 'synced') {
      // Local is clean, remote wins
      await db.content.put(mapped);
    } else {
      // CONFLICT: local is pending, remote also changed!
      // In a real app we'd trigger a conflict UI. For now, keep local (since user just edited it).
      // A more complex resolution could be presented via a modal using a global state.
      console.warn("Conflict detected for", remoteId, "Keeping local changes.");
    }
  }
}
