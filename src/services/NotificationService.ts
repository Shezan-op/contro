import { v4 as uuidv4 } from "uuid";
import { createClient } from "@/lib/supabase/client";

export interface CreateNotificationParams {
  workspaceId: string;
  title: string;
  message: string;
}

export class NotificationService {
  static async getAll(workspaceId: string) {
    // Note: We'd normally create a 'notifications' table in Supabase.
    // If it doesn't exist, this might fail, but assuming we migrate it or it's a dummy for now.
    // Let's implement it for completeness.
    const supabase = createClient();
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('workspaceId', workspaceId)
      .order('created_at', { ascending: false });
      
    if (error || !data) return [];
    
    return data.map(n => ({
      id: n.id,
      workspaceId: n.workspaceId,
      title: n.title,
      message: n.message,
      isRead: n.isRead,
      createdAt: n.created_at
    }));
  }

  static async getUnread(workspaceId: string) {
    const all = await this.getAll(workspaceId);
    return all.filter(n => !n.isRead);
  }

  static async create({ workspaceId, title, message }: CreateNotificationParams) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthenticated");

    const newNotification = {
      id: uuidv4(),
      workspaceId,
      title,
      message,
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    
    await supabase.from('notifications').insert({
      id: newNotification.id,
      user_id: user.id,
      workspaceId: newNotification.workspaceId,
      title: newNotification.title,
      message: newNotification.message,
      isRead: newNotification.isRead,
      created_at: newNotification.createdAt
    });
    
    return newNotification;
  }

  static async markAsRead(id: string) {
    const supabase = createClient();
    await supabase.from('notifications').update({ isRead: true }).eq('id', id);
  }

  static async markAllAsRead(workspaceId: string) {
    const supabase = createClient();
    await supabase.from('notifications').update({ isRead: true }).eq('workspaceId', workspaceId).eq('isRead', false);
  }

  static async delete(id: string) {
    const supabase = createClient();
    await supabase.from('notifications').delete().eq('id', id);
  }
}
