import { UniversalContent } from "@/lib/db";
import { ContentService } from "./ContentService";
import { db } from "@/lib/db";

export class TaskService {
  static async getAll(workspaceId: string): Promise<UniversalContent[]> {
    return await ContentService.getByType(workspaceId, 'TASK');
  }

  static async getActive(workspaceId: string): Promise<UniversalContent[]> {
    const allTasks = await this.getAll(workspaceId);
    return allTasks.filter(task => !task.isCompleted);
  }

  static async getCompleted(workspaceId: string): Promise<UniversalContent[]> {
    const allTasks = await this.getAll(workspaceId);
    return allTasks.filter(task => task.isCompleted);
  }

  static async getTrashed(workspaceId: string): Promise<UniversalContent[]> {
    return await db.content
      .where('workspaceId')
      .equals(workspaceId)
      .filter(c => c.type === 'TASK' && c.isTrashed)
      .toArray();
  }

  static async create(
    workspaceId: string, 
    title: string, 
    partial: Partial<UniversalContent> = {}
  ): Promise<UniversalContent> {
    return await ContentService.create(workspaceId, 'TASK', {
      title,
      isCompleted: false,
      priority: 'low',
      ...partial
    });
  }

  static async toggleCompletion(id: string, isCompleted: boolean): Promise<void> {
    await ContentService.update(id, { isCompleted });
  }

  static async update(id: string, updates: Partial<UniversalContent>): Promise<void> {
    await ContentService.update(id, updates);
  }

  static async delete(id: string): Promise<void> {
    await ContentService.moveToTrash(id);
  }

  static async bulkComplete(ids: string[]): Promise<void> {
    await db.transaction('rw', db.content, async () => {
      await Promise.all(ids.map((id) => db.content.update(id, { isCompleted: true, syncStatus: 'pending' })));
    });
  }

  static async bulkDelete(ids: string[]): Promise<void> {
    await db.transaction('rw', db.content, async () => {
      await Promise.all(ids.map((id) => db.content.update(id, { isTrashed: true, syncStatus: 'pending' })));
    });
  }
}
