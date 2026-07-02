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

  /**
   * Retrieves a single content item by ID.
   */
  static async getById(id: string): Promise<UniversalContent | undefined> {
    return await db.content.get(id);
  }

  /**
   * Creates a new content item.
   */
  static async create(data: Partial<UniversalContent> & { type: ContentType, title: string }): Promise<UniversalContent> {
    const workspace = await WorkspaceService.getDefaultWorkspace();
    
    const newItem: UniversalContent = {
      id: uuidv4(),
      workspaceId: workspace.id,
      type: data.type,
      title: data.title,
      projectId: data.projectId,
      tags: data.tags || [],
      isStarred: data.isStarred || false,
      isArchived: false,
      isTrashed: false,
      syncStatus: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...data, // includes body, description, etc.
    };

    await db.content.add(newItem);
    return newItem;
  }

  /**
   * Updates an existing content item.
   */
  static async update(id: string, updates: Partial<UniversalContent>): Promise<void> {
    await db.content.update(id, {
      ...updates,
      updatedAt: new Date().toISOString(),
      syncStatus: 'pending' // Mark for sync
    });
  }

  /**
   * Moves a content item to trash.
   */
  static async moveToTrash(id: string): Promise<void> {
    await this.update(id, { isTrashed: true });
  }
}
