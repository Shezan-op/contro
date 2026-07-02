import { UniversalContent } from "@/lib/db";
import { ContentService } from "./ContentService";
import { db } from "@/lib/db";

export class LeadMagnetService {
  static async getAll(workspaceId: string): Promise<UniversalContent[]> {
    return await ContentService.getByType(workspaceId, 'LEAD_MAGNET');
  }

  static async getTrashed(workspaceId: string): Promise<UniversalContent[]> {
    return await db.content
      .where('workspaceId')
      .equals(workspaceId)
      .filter(c => c.type === 'LEAD_MAGNET' && c.isTrashed)
      .toArray();
  }

  static async create(workspaceId: string, title: string, description?: string): Promise<UniversalContent> {
    return await ContentService.create(workspaceId, 'LEAD_MAGNET', {
      title,
      description,
    });
  }

  static async update(id: string, updates: Partial<UniversalContent>): Promise<void> {
    await ContentService.update(id, updates);
  }

  static async delete(id: string): Promise<void> {
    await ContentService.moveToTrash(id);
  }

  static async duplicate(id: string): Promise<UniversalContent> {
    return await ContentService.duplicate(id);
  }
}
