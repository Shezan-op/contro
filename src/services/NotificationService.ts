import { db } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";

export interface CreateNotificationParams {
  workspaceId: string;
  title: string;
  message: string;
}

export class NotificationService {
  static async getAll(workspaceId: string) {
    return await db.notifications
      .where("workspaceId")
      .equals(workspaceId)
      .reverse()
      .sortBy("createdAt");
  }

  static async getUnread(workspaceId: string) {
    const all = await this.getAll(workspaceId);
    return all.filter(n => !n.isRead);
  }

  static async create({ workspaceId, title, message }: CreateNotificationParams) {
    const newNotification = {
      id: uuidv4(),
      workspaceId,
      title,
      message,
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    
    await db.notifications.add(newNotification);
    return newNotification;
  }

  static async markAsRead(id: string) {
    await db.notifications.update(id, { isRead: true });
  }

  static async markAllAsRead(workspaceId: string) {
    const unread = await this.getUnread(workspaceId);
    const updates = unread.map(n => db.notifications.update(n.id, { isRead: true }));
    await Promise.all(updates);
  }

  static async delete(id: string) {
    await db.notifications.delete(id);
  }
}
