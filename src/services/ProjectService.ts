import { UniversalContent } from "@/lib/db";
import { ContentService } from "./ContentService";

export class ProjectService {
  /**
   * Gets all projects.
   */
  static async getAll(): Promise<UniversalContent[]> {
    return await ContentService.getByType('PROJECT');
  }

  /**
   * Creates a new project.
   */
  static async create(name: string, description?: string): Promise<UniversalContent> {
    return await ContentService.create({
      type: 'PROJECT',
      title: name,
      description: description,
    });
  }

  /**
   * Toggles the pin status of a project.
   */
  static async togglePin(id: string, isPinned: boolean): Promise<void> {
    await ContentService.update(id, { isStarred: isPinned });
  }

  /**
   * Deletes (moves to trash) a project.
   */
  static async delete(id: string): Promise<void> {
    await ContentService.moveToTrash(id);
  }
}
