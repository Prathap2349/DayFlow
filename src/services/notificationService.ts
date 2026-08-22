// src/services/notificationService.ts
import { supabase } from '../db/supabaseClient';
import type { NotificationItem } from '../types/notification';

export const notificationService = {
  async getNotifications(recipientId?: string): Promise<NotificationItem[]> {
    let query = supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false });

    if (recipientId) {
      query = query.or(`user_id.eq.${recipientId},user_id.is.null`);
    }

    const { data, error } = await query;
    if (error) {
      console.error('Error fetching notifications:', error.message);
      return [];
    }

    return (data || []).map((r: any) => ({
      id: r.id,
      recipientId: r.user_id || 'all',
      type: r.type as any,
      title: r.title,
      message: r.message,
      timestamp: r.created_at,
      read: r.is_read,
    }));
  },

  async getUnreadCount(recipientId: string): Promise<number> {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', recipientId)
      .eq('is_read', false);

    if (error) {
      console.error('Error counting notifications:', error.message);
      return 0;
    }

    return count || 0;
  },

  async addNotification(data: Omit<NotificationItem, 'id' | 'timestamp' | 'read'>): Promise<NotificationItem> {
    const { data: created, error } = await supabase
      .from('notifications')
      .insert({
        user_id: data.recipientId === 'all' ? null : data.recipientId,
        title: data.title,
        message: data.message,
        type: data.type,
        is_read: false,
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding notification:', error.message);
      throw new Error(error.message);
    }

    return {
      id: created.id,
      recipientId: created.user_id || 'all',
      type: created.type,
      title: created.title,
      message: created.message,
      timestamp: created.created_at,
      read: created.is_read,
    };
  },

  async markAsRead(notificationId: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);

    if (error) {
      console.error('Error marking read:', error.message);
    }
  },

  async markAllAsRead(recipientId: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', recipientId);

    if (error) {
      console.error('Error marking all read:', error.message);
    }
  },

  async deleteNotification(notificationId: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId);

    if (error) {
      console.error('Error deleting notification:', error.message);
    }
  },
};
