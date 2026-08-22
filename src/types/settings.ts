// src/types/settings.ts
export interface UserSettings {
  userId: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  weeklyDigest: boolean;
  theme: 'light' | 'dark' | 'system';
  language: string;
  timeZone: string;
}

export interface CompanySettings {
  companyName: string;
  taxId: string;
  workDaysPerWeek: number;
  standardWorkHours: number;
  defaultLeaveQuota: number;
}
