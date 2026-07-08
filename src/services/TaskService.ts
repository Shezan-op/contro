import { UniversalContent } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";
import { useAppStore } from "@/store/useAppStore";
import { createClient } from "@/lib/supabase/client";

export class TaskService {
  static async create(workspaceId: string, title: string, partial: Partial<UniversalContent> = {}): Promise<UniversalContent> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthenticated");

    const task: UniversalContent = {
      id: uuidv4(),
      workspaceId,
      type: 'TASK',
      title,
      projectId: partial.projectId,
      isCompleted: partial.isCompleted || false,
      dueDate: partial.dueDate,
      priority: partial.priority || 'medium',
      reminder: partial.reminder || null,
      isRepeating: partial.isRepeating || false,
      contentPillars: [],
      platform: null,
      status: 'draft',
      scheduledFor: null,
      isStarred: false,
      isArchived: false,
      isTrashed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    useAppStore.getState().setLoadingState('Saving...');

    const { error } = await supabase.from('tasks').insert({
      id: task.id,
      user_id: user.id,
      workspaceId: task.workspaceId,
      title: task.title,
      projectId: task.projectId,
      isCompleted: task.isCompleted,
      dueDate: task.dueDate,
      priority: task.priority,
      reminder: task.reminder,
      isRepeating: task.isRepeating,
      created_at: task.createdAt,
      updated_at: task.updatedAt
    });

    if (error) {
      useAppStore.getState().setLoadingState('Failed to save');
      throw error;
    }
    
    useAppStore.getState().setLoadingState('Saved');
    setTimeout(() => useAppStore.getState().setLoadingState(null), 2000);
    return task;
  }

  static async update(id: string, updates: Partial<UniversalContent>) {
    const supabase = createClient();
    useAppStore.getState().setLoadingState('Saving...');

    const payload: Record<string, any> = {
      updated_at: new Date().toISOString()
    };

    if (updates.title !== undefined) payload.title = updates.title;
    if (updates.isCompleted !== undefined) payload.isCompleted = updates.isCompleted;
    if (updates.dueDate !== undefined) payload.dueDate = updates.dueDate;
    if (updates.priority !== undefined) payload.priority = updates.priority;
    if (updates.reminder !== undefined) payload.reminder = updates.reminder;
    if (updates.isRepeating !== undefined) payload.isRepeating = updates.isRepeating;

    const { error } = await supabase.from('tasks').update(payload).eq('id', id);

    if (error) {
      useAppStore.getState().setLoadingState('Failed to save');
      throw error;
    }

    useAppStore.getState().setLoadingState('Saved');
    setTimeout(() => useAppStore.getState().setLoadingState(null), 2000);
  }

  static async getActive(workspaceId: string, projectId?: string): Promise<UniversalContent[]> {
    const supabase = createClient();
    let query = supabase
      .from('tasks')
      .select('*')
      .eq('workspaceId', workspaceId)
      .is('deleted_at', null)
      .eq('isCompleted', false);

    if (projectId) {
      query = query.eq('projectId', projectId);
    }
      
    const { data, error } = await query;
    if (error || !data) return [];
    return data.map(this.mapToUniversal).sort((a, b) => 
      new Date(a.createdAt!).getTime() - new Date(b.createdAt!).getTime()
    );
  }

  static async deletePermanently(id: string) {
    const supabase = createClient();
    useAppStore.getState().setLoadingState('Saving...');
    const { error } = await supabase.from('tasks').update({
      deleted_at: new Date().toISOString()
    }).eq('id', id);

    if (error) {
      useAppStore.getState().setLoadingState('Failed to delete');
      throw error;
    }
    useAppStore.getState().setLoadingState(null);
  }

  private static mapToUniversal(remote: any): UniversalContent {
    return {
      id: remote.id,
      workspaceId: remote.workspaceId,
      type: 'TASK',
      title: remote.title || '',
      projectId: remote.projectId,
      isCompleted: remote.isCompleted || false,
      dueDate: remote.dueDate,
      priority: remote.priority || 'medium',
      reminder: remote.reminder,
      isRepeating: remote.isRepeating || false,
      contentPillars: [],
      platform: null,
      status: 'draft',
      scheduledFor: null,
      createdAt: remote.created_at,
      updatedAt: remote.updated_at,
      deletedAt: remote.deleted_at,
      isStarred: false,
      isArchived: false,
      isTrashed: false,
    };
  }
}
