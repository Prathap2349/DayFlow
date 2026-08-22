// src/types/notification.ts
export type NotificationType =
  | 'leave_approved'
  | 'leave_rejected'
  | 'leave_pending'
  | 'attendance_reminder'
  | 'profile_update'
  | 'payroll_update'
  | 'hr_announcement';

export interface NotificationItem {
  id: string;
  recipientId: string; // 'all' or employeeId
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  link?: string;
}
