// src/types/announcement.ts
export type AnnouncementCategory = 'General' | 'Urgent' | 'Event' | 'Policy';

export interface Announcement {
  id: string;
  title: string;
  content: string;
  category: AnnouncementCategory;
  isPinned: boolean;
  targetDepartment?: string;
  authorName: string;
  createdAt: string; // YYYY-MM-DD or formatted date
}
