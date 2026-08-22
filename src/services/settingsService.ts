// src/services/settingsService.ts
import type { UserSettings, CompanySettings } from '../types/settings';

const USER_SETTINGS_KEY = 'dayflow_user_settings';
const COMPANY_SETTINGS_KEY = 'dayflow_company_settings';

const DEFAULT_USER_SETTINGS: UserSettings = {
  userId: 'usr_001',
  emailNotifications: true,
  pushNotifications: true,
  weeklyDigest: false,
  theme: 'light',
  language: 'English',
  timeZone: 'Asia/Kolkata (GMT+5:30)',
};

const DEFAULT_COMPANY_SETTINGS: CompanySettings = {
  companyName: 'Dayflow Technologies',
  taxId: 'TAX-IN-99482910',
  workDaysPerWeek: 5,
  standardWorkHours: 8,
  defaultLeaveQuota: 24,
};

export const settingsService = {
  async getUserSettings(): Promise<UserSettings> {
    try {
      const raw = localStorage.getItem(USER_SETTINGS_KEY);
      return raw ? JSON.parse(raw) : DEFAULT_USER_SETTINGS;
    } catch {
      return DEFAULT_USER_SETTINGS;
    }
  },

  async updateUserSettings(settings: Partial<UserSettings>): Promise<UserSettings> {
    const current = await this.getUserSettings();
    const updated = { ...current, ...settings };
    localStorage.setItem(USER_SETTINGS_KEY, JSON.stringify(updated));
    return updated;
  },

  async getCompanySettings(): Promise<CompanySettings> {
    try {
      const raw = localStorage.getItem(COMPANY_SETTINGS_KEY);
      return raw ? JSON.parse(raw) : DEFAULT_COMPANY_SETTINGS;
    } catch {
      return DEFAULT_COMPANY_SETTINGS;
    }
  },

  async updateCompanySettings(settings: Partial<CompanySettings>): Promise<CompanySettings> {
    const current = await this.getCompanySettings();
    const updated = { ...current, ...settings };
    localStorage.setItem(COMPANY_SETTINGS_KEY, JSON.stringify(updated));
    return updated;
  },
};
