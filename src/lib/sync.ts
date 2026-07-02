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
    // 1. Push projects
    const pendingProjects = await db.projects.where('syncStatus').equals('pending').toArray();
    for (const project of pendingProjects) {
      const { syncStatus, ...data } = project;
      const { error } = await supabase.from('projects').upsert(data);
      if (!error) {
        await db.projects.update(project.id, { syncStatus: 'synced' });
      }
    }

    // 2. Push items
    const pendingItems = await db.items.where('syncStatus').equals('pending').toArray();
    for (const item of pendingItems) {
      const { syncStatus, ...data } = item;
      const { error } = await supabase.from('content_items').upsert(data);
      if (!error) {
        await db.items.update(item.id, { syncStatus: 'synced' });
      }
    }

    // 3. Push tasks
    const pendingTasks = await db.tasks.where('syncStatus').equals('pending').toArray();
    for (const task of pendingTasks) {
      const { syncStatus, ...data } = task;
      const { error } = await supabase.from('tasks').upsert(data);
      if (!error) {
        await db.tasks.update(task.id, { syncStatus: 'synced' });
      }
    }
  }

  private async pullRemoteChanges() {
    // Implement pull logic using last synced timestamp
    // For MVP, we fetch everything and update local
    // (This should be optimized with an updatedAt cursor)
    
    // Fetch projects
    const { data: projects } = await supabase.from('projects').select('*');
    if (projects) {
      for (const p of projects) {
        await db.projects.put({ ...p, syncStatus: 'synced' });
      }
    }

    // Fetch items
    const { data: items } = await supabase.from('content_items').select('*');
    if (items) {
      for (const item of items) {
        await db.items.put({ ...item, syncStatus: 'synced' });
      }
    }

    // Fetch tasks
    const { data: tasks } = await supabase.from('tasks').select('*');
    if (tasks) {
      for (const task of tasks) {
        await db.tasks.put({ ...task, syncStatus: 'synced' });
      }
    }
  }
}

export const syncEngine = new SyncEngine();
