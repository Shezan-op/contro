import { UniversalContent, ContentType } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";
import { useAppStore } from "@/store/useAppStore";
import { createClient } from "@/lib/supabase/client";

export class ContentService {
  static async create(workspaceId: string, type: ContentType, partial: Partial<UniversalContent> = {}) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthenticated");

    const content: UniversalContent = {
      id: uuidv4(),
      workspaceId,
      type,
      title: partial.title || '',
      body: partial.body || { type: 'doc', content: [] }, // Empty TipTap doc
      contentPillars: partial.contentPillars || [],
      platform: partial.platform || null,
      status: partial.status || 'draft',
      scheduledFor: partial.scheduledFor || null,
      isStarred: partial.isStarred || false,
      isArchived: partial.isArchived || false,
      isTrashed: partial.isTrashed || false,
      projectId: partial.projectId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...partial
    };

    useAppStore.getState().setLoadingState('Saving...');

    const { error } = await supabase.from('content_items').insert({
      id: content.id,
      user_id: user.id,
      workspaceId: content.workspaceId,
      title: content.title,
      status: content.status,
      platform: content.platform,
      contentPillars: content.contentPillars,
      isStarred: content.isStarred,
      isArchived: content.isArchived,
      isTrashed: content.isTrashed,
      projectId: content.projectId,
      body: content.body as any,
      cta: content.cta,
      scheduledFor: content.scheduledFor,
      created_at: content.createdAt,
      updated_at: content.updatedAt
    });

    if (error) {
      useAppStore.getState().setLoadingState('Failed to save');
      throw error;
    }
    
    useAppStore.getState().setLoadingState('Saved');
    setTimeout(() => useAppStore.getState().setLoadingState(null), 2000);
    return content;
  }

  static async update(id: string, updates: Partial<UniversalContent>) {
    const supabase = createClient();
    useAppStore.getState().setLoadingState('Saving...');

    const payload: any = {
      updated_at: new Date().toISOString()
    };

    if (updates.title !== undefined) payload.title = updates.title;
    if (updates.body !== undefined) payload.body = updates.body;
    if (updates.status !== undefined) payload.status = updates.status;
    if (updates.platform !== undefined) payload.platform = updates.platform;
    if (updates.contentPillars !== undefined) payload.contentPillars = updates.contentPillars;
    if (updates.isStarred !== undefined) payload.isStarred = updates.isStarred;
    if (updates.isArchived !== undefined) payload.isArchived = updates.isArchived;
    if (updates.isTrashed !== undefined) payload.isTrashed = updates.isTrashed;
    if (updates.projectId !== undefined) payload.projectId = updates.projectId;
    if (updates.cta !== undefined) payload.cta = updates.cta;
    if (updates.scheduledFor !== undefined) payload.scheduledFor = updates.scheduledFor;

    const { error } = await supabase.from('content_items').update(payload).eq('id', id);

    if (error) {
      useAppStore.getState().setLoadingState('Failed to save');
      throw error;
    }

    useAppStore.getState().setLoadingState('Saved');
    setTimeout(() => useAppStore.getState().setLoadingState(null), 2000);
  }

  static async getById(id: string): Promise<UniversalContent | null> {
    const supabase = createClient();
    const { data, error } = await supabase.from('content_items').select('*').eq('id', id).single();
    if (error || !data) return null;
    return this.mapToUniversal(data);
  }

  static async getAll(workspaceId: string): Promise<UniversalContent[]> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('content_items')
      .select('*')
      .eq('workspaceId', workspaceId)
      .is('deleted_at', null)
      .eq('isTrashed', false);
      
    if (error || !data) return [];
    return data.map(this.mapToUniversal);
  }

  static async getByProject(workspaceId: string, projectId: string): Promise<UniversalContent[]> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('content_items')
      .select('*')
      .eq('workspaceId', workspaceId)
      .eq('projectId', projectId)
      .is('deleted_at', null)
      .eq('isTrashed', false);
      
    if (error || !data) return [];
    return data.map(this.mapToUniversal);
  }

  static async search(workspaceId: string, query: string): Promise<UniversalContent[]> {
    const q = query.toLowerCase();
    const all = await this.getAll(workspaceId);
    return all.filter(c => {
      const matchTitle = c.title.toLowerCase().includes(q);
      const matchPillars = c.contentPillars.some(p => p.toLowerCase().includes(q));
      const matchDesc = c.description?.toLowerCase().includes(q) || false;
      return matchTitle || matchPillars || matchDesc;
    });
  }

  static async duplicate(id: string) {
    const original = await this.getById(id);
    if (!original) throw new Error("Content not found");
    
    const { id: _, ...rest } = original;
    const duplicated: Partial<UniversalContent> = {
      ...rest,
      title: `${original.title} (Copy)`,
      status: 'draft',
      scheduledFor: null,
    };
    
    return await this.create(original.workspaceId, 'DRAFT', duplicated);
  }

  static async archive(id: string) {
    await this.update(id, { isArchived: true });
  }

  static async restore(id: string) {
    await this.update(id, { isArchived: false, isTrashed: false });
  }

  static async getByType(workspaceId: string, type: ContentType): Promise<UniversalContent[]> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('content_items')
      .select('*')
      .eq('workspaceId', workspaceId)
      .is('deleted_at', null)
      .eq('isTrashed', false)
      .eq('isArchived', false)
      .order('created_at', { ascending: false });

    if (error || !data) return [];
    // Currently, all content_items are DRAFT type essentially, 
    // unless we mapped type to a specific column, but our old implementation just filtered by type field.
    // Wait, the db model had 'type' but Supabase separated 'projects', 'tasks' etc into different tables.
    // So 'content_items' implicitly are DRAFT and ASSET.
    return data.map(this.mapToUniversal).filter(c => c.type === type);
  }

  static async getDrafts(workspaceId: string) {
    return this.getByType(workspaceId, 'DRAFT');
  }

  static async moveToTrash(id: string) {
    await this.update(id, { isTrashed: true });
  }

  static async deletePermanently(id: string) {
    const supabase = createClient();
    useAppStore.getState().setLoadingState('Saving...');
    const { error } = await supabase.from('content_items').update({
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
      type: 'DRAFT', // 'content_items' map to DRAFT basically
      title: remote.title || '',
      body: remote.body || { type: 'doc', content: [] },
      cta: remote.cta || '',
      projectId: remote.projectId,
      contentPillars: remote.contentPillars || [],
      platform: remote.platform || null,
      status: remote.status || 'draft',
      scheduledFor: remote.scheduledFor || null,
      createdAt: remote.created_at,
      updatedAt: remote.updated_at,
      deletedAt: remote.deleted_at,
      isStarred: remote.isStarred || false,
      isArchived: remote.isArchived || false,
      isTrashed: remote.isTrashed || false,
    };
  }
}
