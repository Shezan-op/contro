import { UniversalContent } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";
import { useAppStore } from "@/store/useAppStore";
import { createClient } from "@/lib/supabase/client";

export class LeadMagnetService {
  static async create(workspaceId: string, title: string, partial: Partial<UniversalContent> = {}): Promise<UniversalContent> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthenticated");

    const magnet: UniversalContent = {
      id: uuidv4(),
      workspaceId,
      type: 'LEAD_MAGNET',
      title,
      description: partial.description || '',
      assetUrl: partial.assetUrl || '',
      assetType: partial.assetType || 'pdf',
      status: partial.status || 'draft',
      contentPillars: [],
      platform: null,
      scheduledFor: null,
      isStarred: false,
      isArchived: false,
      isTrashed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    useAppStore.getState().setLoadingState('Saving...');

    const { error } = await supabase.from('lead_magnets').insert({
      id: magnet.id,
      user_id: user.id,
      workspaceId: magnet.workspaceId,
      title: magnet.title,
      description: magnet.description,
      assetUrl: magnet.assetUrl,
      assetType: magnet.assetType,
      status: magnet.status,
      created_at: magnet.createdAt,
      updated_at: magnet.updatedAt
    });

    if (error) {
      useAppStore.getState().setLoadingState('Failed to save');
      throw error;
    }
    
    useAppStore.getState().setLoadingState('Saved');
    setTimeout(() => useAppStore.getState().setLoadingState(null), 2000);
    return magnet;
  }

  static async update(id: string, updates: Partial<UniversalContent>) {
    const supabase = createClient();
    useAppStore.getState().setLoadingState('Saving...');

    const payload: Record<string, unknown> = {
      updated_at: new Date().toISOString()
    };

    if (updates.title !== undefined) payload.title = updates.title;
    if (updates.description !== undefined) payload.description = updates.description;
    if (updates.assetUrl !== undefined) payload.assetUrl = updates.assetUrl;
    if (updates.assetType !== undefined) payload.assetType = updates.assetType;
    if (updates.status !== undefined) payload.status = updates.status;

    const { error } = await supabase.from('lead_magnets').update(payload).eq('id', id);

    if (error) {
      useAppStore.getState().setLoadingState('Failed to save');
      throw error;
    }

    useAppStore.getState().setLoadingState('Saved');
    setTimeout(() => useAppStore.getState().setLoadingState(null), 2000);
  }

  static async getAll(workspaceId: string): Promise<UniversalContent[]> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('lead_magnets')
      .select('*')
      .eq('workspaceId', workspaceId)
      .is('deleted_at', null);
      
    if (error || !data) return [];
    return data.map(this.mapToUniversal).sort((a, b) => 
      new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
    );
  }

  static async deletePermanently(id: string) {
    const supabase = createClient();
    useAppStore.getState().setLoadingState('Saving...');
    const { error } = await supabase.from('lead_magnets').update({
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
      .from('lead_magnets')
      .select('*')
      .eq('id', id)
      .single();
    
    if (!source) return;
    
    const newId = uuidv4();
    const { error } = await supabase.from('lead_magnets').insert({
      ...source,
      id: newId,
      title: `${source.title} (Copy)`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

    if (error) throw error;
  }

  private static mapToUniversal(remote: Record<string, unknown>): UniversalContent {
    return {
      id: remote.id,
      workspaceId: remote.workspaceId,
      type: 'LEAD_MAGNET',
      title: remote.title || '',
      description: remote.description || '',
      assetUrl: remote.assetUrl || '',
      assetType: remote.assetType || 'pdf',
      status: remote.status || 'draft',
      contentPillars: [],
      platform: null,
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
