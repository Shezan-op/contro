import { UniversalContent } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";
import { useAppStore } from "@/store/useAppStore";
import { createClient } from "@/lib/supabase/client";

export class ProjectService {
  static async create(workspaceId: string, title: string, description: string = ""): Promise<UniversalContent> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthenticated");

    const project: UniversalContent = {
      id: uuidv4(),
      workspaceId,
      type: 'PROJECT',
      title,
      description,
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

    const { error } = await supabase.from('projects').insert({
      id: project.id,
      user_id: user.id,
      workspaceId: project.workspaceId,
      title: project.title,
      description: project.description,
      status: project.status,
      isStarred: project.isStarred,
      isArchived: project.isArchived,
      isTrashed: project.isTrashed,
      created_at: project.createdAt,
      updated_at: project.updatedAt
    });

    if (error) {
      useAppStore.getState().setLoadingState('Failed to save');
      throw error;
    }
    
    useAppStore.getState().setLoadingState('Saved');
    setTimeout(() => useAppStore.getState().setLoadingState(null), 2000);
    return project;
  }

  static async update(id: string, updates: Partial<UniversalContent>) {
    const supabase = createClient();
    useAppStore.getState().setLoadingState('Saving...');

    const payload: any = {
      updated_at: new Date().toISOString()
    };

    if (updates.title !== undefined) payload.title = updates.title;
    if (updates.description !== undefined) payload.description = updates.description;
    if (updates.status !== undefined) payload.status = updates.status;
    if (updates.isStarred !== undefined) payload.isStarred = updates.isStarred;
    if (updates.isArchived !== undefined) payload.isArchived = updates.isArchived;
    if (updates.isTrashed !== undefined) payload.isTrashed = updates.isTrashed;

    const { error } = await supabase.from('projects').update(payload).eq('id', id);

    if (error) {
      useAppStore.getState().setLoadingState('Failed to save');
      throw error;
    }

    useAppStore.getState().setLoadingState('Saved');
    setTimeout(() => useAppStore.getState().setLoadingState(null), 2000);
  }

  static async getById(id: string): Promise<UniversalContent | null> {
    const supabase = createClient();
    const { data, error } = await supabase.from('projects').select('*').eq('id', id).single();
    if (error || !data) return null;
    return this.mapToUniversal(data);
  }

  static async getAll(workspaceId: string): Promise<UniversalContent[]> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('workspaceId', workspaceId)
      .is('deleted_at', null)
      .eq('isTrashed', false);
      
    if (error || !data) return [];
    return data.map(this.mapToUniversal).sort((a, b) => 
      new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
    );
  }

  static async getArchived(workspaceId: string): Promise<UniversalContent[]> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('workspaceId', workspaceId)
      .is('deleted_at', null)
      .eq('isArchived', true);
      
    if (error || !data) return [];
    return data.map(this.mapToUniversal);
  }

  static async archive(id: string) {
    await this.update(id, { isArchived: true });
  }

  static async deletePermanently(id: string) {
    const supabase = createClient();
    useAppStore.getState().setLoadingState('Saving...');
    const { error } = await supabase.from('projects').update({
      deleted_at: new Date().toISOString()
    }).eq('id', id);

    if (error) {
      useAppStore.getState().setLoadingState('Failed to delete');
      throw error;
    }
    useAppStore.getState().setLoadingState(null);
  }

  static async duplicate(id: string) {
    const supabase = createClient();
    const { data: source } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single();
    
    if (!source) return;
    
    const newId = uuidv4();
    const { error } = await supabase.from('projects').insert({
      ...source,
      id: newId,
      title: `${source.title} (Copy)`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

    if (error) throw error;
  }

  private static mapToUniversal(remote: any): UniversalContent {
    return {
      id: remote.id,
      workspaceId: remote.workspaceId,
      type: 'PROJECT',
      title: remote.title || '',
      description: remote.description || '',
      contentPillars: [],
      platform: null,
      status: remote.status || 'draft',
      scheduledFor: null,
      createdAt: remote.created_at,
      updatedAt: remote.updated_at,
      deletedAt: remote.deleted_at,
      isStarred: remote.isStarred || false,
      isArchived: remote.isArchived || false,
      isTrashed: remote.isTrashed || false,
    };
  }
}
