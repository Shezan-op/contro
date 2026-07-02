import { UniversalContent } from "@/lib/db";
import { ContentService } from "./ContentService";

export class TaskService {
  /**
   * Gets all active tasks.
   */
  static async getActive(): Promise<UniversalContent[]> {
    const allTasks = await ContentService.getByType('TASK');
    return allTasks.filter(task => !task.isCompleted);
  }

  /**
   * Creates a new task.
   */
  static async create(title: string, projectId?: string, dueDate?: string): Promise<UniversalContent> {
    return await ContentService.create({
      type: 'TASK',
      title,
      projectId,
      dueDate,
      isCompleted: false
    });
  }

  /**
   * Toggles the completion status of a task.
   */
  static async toggleCompletion(id: string, isCompleted: boolean): Promise<void> {
    await ContentService.update(id, { isCompleted });
  }

  /**
   * Deletes (moves to trash) a task.
   */
  static async delete(id: string): Promise<void> {
    await ContentService.moveToTrash(id);
  }
}
