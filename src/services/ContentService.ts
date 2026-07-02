import { db, UniversalContent, ContentType } from "@/lib/db";
import { WorkspaceService } from "./WorkspaceService";
import { v4 as uuidv4 } from "uuid";

export class ContentService {
  /**
   * Retrieves all content of a specific type.
   */
  static async getByType(type: ContentType): Promise<UniversalContent[]> {
    const workspace = await WorkspaceService.getDefaultWorkspace();
    return await db.content
      .where("workspaceId")
      .equals(workspace.id)
      .and((item) => item.type === type && !item.isTrashed)
      .toArray();
  }

  static async create(workspaceId: string, type: ContentType, partial: Partial<UniversalContent> = {}) {
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
      syncStatus: 'pending',
      projectId: partial.projectId,
      ...partial
    };

    await db.content.add(content);
    return content;
  }

  static async update(id: string, updates: Partial<UniversalContent>) {
    await db.content.update(id, {
      ...updates,
      syncStatus: 'pending' // Mark for sync when changed
    });
  }

  static async getById(id: string) {
    return await db.content.get(id);
  }

  static async getAll(workspaceId: string) {
    return await db.content
      .where('workspaceId')
      .equals(workspaceId)
      .filter(c => !c.isTrashed)
      .toArray();
  }

  static async search(workspaceId: string, query: string) {
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
    
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id: _, ...rest } = original;
    const duplicated: UniversalContent = {
      ...rest,
      id: uuidv4(),
      title: `${original.title} (Copy)`,
      status: 'draft',
      scheduledFor: null,
      syncStatus: 'pending',
    };
    
    await db.content.add(duplicated);
    return duplicated;
  }

  static async archive(id: string) {
    await db.content.update(id, { isArchived: true, syncStatus: 'pending' });
  }

  static async restore(id: string) {
    await db.content.update(id, { isArchived: false, isTrashed: false, syncStatus: 'pending' });
  }

  static async getByType(workspaceId: string, type: ContentType) {
    return await db.content
      .where('workspaceId')
      .equals(workspaceId)
      .filter(c => c.type === type && !c.isTrashed && !c.isArchived)
      .reverse()
      .sortBy('id'); // Will be replaced with createdAt if we add it, or use manual sort
  }

  static async getDrafts(workspaceId: string) {
    return this.getByType(workspaceId, 'DRAFT');
  }

  static async moveToTrash(id: string) {
    await db.content.update(id, { isTrashed: true, syncStatus: 'pending' });
  }

  static async deletePermanently(id: string) {
    await db.content.delete(id);
  }
}
