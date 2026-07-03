import { createClient } from '@/lib/supabase/client';
import { db, UniversalContent } from '@/lib/db';
import { useAppStore } from '@/store/useAppStore';

const supabase = createClient();

export class SyncEngine {
  static async startSync() {
    if (typeof window === 'undefined') return;
    
    // Initial Push of pending local changes
    await this.pushPendingChanges();

    // Initial Pull
    await this.pullAllChanges();

    // Setup Realtime Subscriptions
    // We can't rely on updated_at since it was intentionally excluded,
    // so we rely on initial pull and real-time events.
    const channels = supabase.channel('custom-all-channel')
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

  static getTableName(type: string) {
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
        const { syncStatus, type, ...dbItem } = item;
        
        // Map fields to what Supabase expects based on our schema
        const payload: any = {
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

        if (table === 'projects') {
          payload.description = dbItem.description;
        } else if (table === 'tasks') {
          payload.projectId = dbItem.projectId;
          payload.isCompleted = dbItem.isCompleted;
          payload.dueDate = dbItem.dueDate;
          payload.priority = dbItem.priority;
          payload.reminder = dbItem.reminder;
          payload.isRepeating = dbItem.isRepeating;
        } else if (table === 'lead_magnets') {
          payload.description = dbItem.description;
          payload.assetUrl = dbItem.assetUrl;
          payload.assetType = dbItem.assetType;
        } else {
          payload.projectId = dbItem.projectId;
          payload.body = dbItem.body;
          payload.cta = dbItem.cta;
          payload.scheduledFor = dbItem.scheduledFor;
        }

        const { error } = await supabase.from(table).upsert(payload);
        
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

      const tables = ['projects', 'content_items', 'tasks', 'lead_magnets'];
      
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

  static async handleRemoteChange(payload: any) {
    if (payload.eventType === 'DELETE') {
      await db.content.delete(payload.old.id);
    } else {
      await this.mergeRemoteItem(payload.table, payload.new);
    }
    useAppStore.getState().refreshData();
  }

  static async mergeRemoteItem(table: string, remote: any) {
    const local = await db.content.get(remote.id);
    
    let type: any = 'DRAFT';
    if (table === 'projects') type = 'PROJECT';
    if (table === 'tasks') type = 'TASK';
    if (table === 'lead_magnets') type = 'LEAD_MAGNET';

    const mapped = {
      id: remote.id,
      workspaceId: remote.workspaceId,
      type,
      title: remote.title,
      status: remote.status,
      platform: remote.platform,
      contentPillars: remote.contentPillars || [],
      isStarred: remote.isStarred || false,
      isArchived: remote.isArchived || false,
      isTrashed: remote.isTrashed || false,
      syncStatus: 'synced' as const,
    } as UniversalContent;

    if (table === 'projects') {
      mapped.description = remote.description;
    } else if (table === 'tasks') {
      mapped.projectId = remote.projectId;
      mapped.isCompleted = remote.isCompleted;
      mapped.dueDate = remote.dueDate;
      mapped.priority = remote.priority;
      mapped.reminder = remote.reminder;
      mapped.isRepeating = remote.isRepeating;
    } else if (table === 'lead_magnets') {
      mapped.description = remote.description;
      mapped.assetUrl = remote.assetUrl;
      mapped.assetType = remote.assetType;
    } else {
      mapped.projectId = remote.projectId;
      mapped.body = remote.body;
      mapped.cta = remote.cta;
      mapped.scheduledFor = remote.scheduledFor;
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
      console.warn("Conflict detected for", local.id, "Keeping local changes.");
    }
  }
}
