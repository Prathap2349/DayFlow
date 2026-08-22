// src/services/badgeService.ts
export interface BadgeItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  colorBg: string;
  colorText: string;
  unlockedAt: string;
}

export const badgeService = {
  getEmployeeBadges(_employeeId?: string): BadgeItem[] {
    return [
      {
        id: 'b1',
        title: '⚡ 30-Day Punctuality Streak',
        description: 'Checked in on time for 30 consecutive workdays without delay.',
        icon: '⚡',
        colorBg: 'bg-amber-50 border-amber-200 dark:bg-amber-950/40 dark:border-amber-800',
        colorText: 'text-amber-700 dark:text-amber-300',
        unlockedAt: 'Achieved Oct 2026',
      },
      {
        id: 'b2',
        title: '🏆 Star Performer',
        description: 'Voted top workforce team contributor by HR and department lead.',
        icon: '🏆',
        colorBg: 'bg-indigo-50 border-indigo-200 dark:bg-indigo-950/40 dark:border-indigo-800',
        colorText: 'text-indigo-700 dark:text-indigo-300',
        unlockedAt: 'Achieved Sep 2026',
      },
      {
        id: 'b3',
        title: '🛡️ Network Guardian',
        description: '100% verified Office Wi-Fi location punch-ins with zero attendance flags.',
        icon: '🛡️',
        colorBg: 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800',
        colorText: 'text-emerald-700 dark:text-emerald-300',
        unlockedAt: 'Active Status',
      },
    ];
  },
};
