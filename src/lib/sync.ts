import { db } from './db';
import { supabase } from './supabase/client';

export class SyncEngine {
  private isSyncing = false;

  async sync() {
    if (this.isSyncing || !navigator.onLine) return;
    this.isSyncing = true;

    try {
      await this.pushPendingChanges();
      await this.pullRemoteChanges();
    } catch (err) {
      console.error('Sync failed:', err);
    } finally {
      this.isSyncing = false;
    }
  }

  private async pushPendingChanges() {
    const pendingContent = await db.content.where('syncStatus').equals('pending').toArray();
    for (const item of pendingContent) {
      const { syncStatus: _s, ...data } = item;
      const { error } = await supabase.from('universal_content').upsert(data);
      if (!error) {
        await db.content.update(item.id, { syncStatus: 'synced' });
      }
    }
  }

  private async pullRemoteChanges() {
    const { data: content } = await supabase.from('universal_content').select('*');
    if (content) {
      for (const item of content) {
        await db.content.put({ ...item, syncStatus: 'synced' });
      }
    }
  }
}

export const syncEngine = new SyncEngine();
