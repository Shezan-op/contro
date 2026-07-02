import { UniversalContent } from "@/lib/db";
import { ContentService } from "./ContentService";
import { db } from "@/lib/db";

export class ProjectService {
  static async getAll(workspaceId: string): Promise<UniversalContent[]> {
    return await ContentService.getByType(workspaceId, 'PROJECT');
  }

  static async getArchived(workspaceId: string): Promise<UniversalContent[]> {
    return await db.content
      .where('workspaceId')
      .equals(workspaceId)
      .filter(c => c.type === 'PROJECT' && c.isArchived && !c.isTrashed)
      .toArray();
  }

  static async getTrashed(workspaceId: string): Promise<UniversalContent[]> {
    return await db.content
      .where('workspaceId')
      .equals(workspaceId)
      .filter(c => c.type === 'PROJECT' && c.isTrashed)
      .toArray();
  }

  static async create(workspaceId: string, name: string, description?: string): Promise<UniversalContent> {
    return await ContentService.create(workspaceId, 'PROJECT', {
      title: name,
      description: description,
    });
  }

  static async rename(id: string, name: string): Promise<void> {
    await ContentService.update(id, { title: name });
  }

  static async togglePin(id: string, isPinned: boolean): Promise<void> {
    await ContentService.update(id, { isStarred: isPinned });
  }

  static async archive(id: string): Promise<void> {
    await ContentService.archive(id);
  }

  static async delete(id: string): Promise<void> {
    await ContentService.moveToTrash(id);
  }

  static async duplicate(id: string): Promise<UniversalContent> {
    return await ContentService.duplicate(id);
  }

  static async getContents(workspaceId: string, projectId: string): Promise<UniversalContent[]> {
    return await db.content
      .where('workspaceId')
      .equals(workspaceId)
      .filter(c => c.projectId === projectId && !c.isTrashed)
      .toArray();
  }
}
