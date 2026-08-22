// src/services/announcementService.ts
import { supabase } from '../db/supabaseClient';
import type { Announcement, AnnouncementCategory } from '../types/announcement';

export const announcementService = {
  /**
   * Fetch all broadcast announcements (pinned ones first)
   */
  async getAnnouncements(): Promise<Announcement[]> {
    try {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Error fetching announcements:', error.message);
        return this.getFallbackAnnouncements();
      }

      return (data || []).map(this.mapDbRecord);
    } catch (err) {
      console.warn('Unhandled exception in getAnnouncements:', err);
      return this.getFallbackAnnouncements();
    }
  },

  /**
   * Post a new announcement (HR Feature)
   */
  async createAnnouncement(data: {
    title: string;
    content: string;
    category: AnnouncementCategory;
    isPinned?: boolean;
    authorName?: string;
  }): Promise<Announcement> {
    const payload = {
      title: data.title.trim(),
      content: data.content.trim(),
      category: data.category,
      is_pinned: !!data.isPinned,
      author_name: data.authorName || 'HR Team',
    };

    const { data: created, error } = await supabase
      .from('announcements')
      .insert(payload)
      .select()
      .single();

    if (error) {
      console.error('Error creating announcement:', error.message);
      throw new Error(error.message);
    }

    return this.mapDbRecord(created);
  },

  /**
   * Toggle Pin/Unpin status
   */
  async togglePin(id: string, currentPinStatus: boolean): Promise<void> {
    const { error } = await supabase
      .from('announcements')
      .update({ is_pinned: !currentPinStatus })
      .eq('id', id);

    if (error) throw new Error(error.message);
  },

  /**
   * Delete an announcement
   */
  async deleteAnnouncement(id: string): Promise<void> {
    const { error } = await supabase.from('announcements').delete().eq('id', id);
    if (error) throw new Error(error.message);
  },

  mapDbRecord(r: any): Announcement {
    return {
      id: r.id,
      title: r.title,
      content: r.content,
      category: r.category || 'General',
      isPinned: !!r.is_pinned,
      targetDepartment: r.target_department || 'All',
      authorName: r.author_name || 'HR Team',
      createdAt: r.created_at ? new Date(r.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Today',
    };
  },

  getFallbackAnnouncements(): Announcement[] {
    return [
      {
        id: 'fallback-1',
        title: 'Annual Townhall Meeting & Q3 Strategy Presentation',
        content: 'Join us this Friday at 3:00 PM for our virtual Townhall. Executive leadership will share product roadmap updates and celebrate team accomplishments!',
        category: 'Event',
        isPinned: true,
        authorName: 'Ananya Gupta (HR Lead)',
        createdAt: 'Oct 14, 2026',
      },
      {
        id: 'fallback-2',
        title: 'Updated Remote Work & Wi-Fi Check-in Policy',
        content: 'Please ensure you are connected to an approved Office Wi-Fi network when punching in for office days. Contact HR for WFH exception overrides.',
        category: 'Policy',
        isPinned: true,
        authorName: 'Ananya Gupta (HR Lead)',
        createdAt: 'Oct 10, 2026',
      },
      {
        id: 'fallback-3',
        title: 'Q3 Wellness Allowance Claim Submission Deadline',
        content: 'Friendly reminder to submit your fitness and wellness expense claims before the end of the month to receive reimbursement in this payroll cycle.',
        category: 'General',
        isPinned: false,
        authorName: 'Finance Team',
        createdAt: 'Oct 05, 2026',
      },
    ];
  },
};
