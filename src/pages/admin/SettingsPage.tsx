// src/pages/admin/SettingsPage.tsx
import { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import { Card, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { settingsService } from '../../services/settingsService';
import type { UserSettings, CompanySettings } from '../../types/settings';
import toast from 'react-hot-toast';

export function AdminSettingsPage() {
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null);
  const [companySettings, setCompanySettings] = useState<CompanySettings | null>(null);
  const [activeTab, setActiveTab] = useState<'General' | 'Notifications' | 'Security'>('General');

  useEffect(() => {
    settingsService.getUserSettings().then(setUserSettings);
    settingsService.getCompanySettings().then(setCompanySettings);
  }, []);

  const handleSaveCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companySettings) return;
    await settingsService.updateCompanySettings(companySettings);
    toast.success('Company preferences saved successfully!');
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userSettings) return;
    await settingsService.updateUserSettings(userSettings);
    toast.success('User notification settings saved!');
  };

  if (!userSettings || !companySettings) {
    return <div className="p-8 text-center text-slate-400">Loading settings...</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-xl font-bold text-slate-900">System & Preference Settings</h2>
        <p className="text-xs text-slate-500 mt-0.5">Configure organization policies, notification alerts, and security options</p>
      </div>

      <div className="flex border-b border-slate-200 text-xs font-semibold gap-6">
        {(['General', 'Notifications', 'Security'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-2.5 transition-colors ${
              activeTab === tab
                ? 'border-b-2 border-indigo-600 text-indigo-600'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {tab} Settings
          </button>
        ))}
      </div>

      {activeTab === 'General' && (
        <Card>
          <CardHeader title="Company & HR Policy Configuration" subtitle="General organization parameters" />
          <form onSubmit={handleSaveCompany} className="space-y-4 text-xs mt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Company Name"
                value={companySettings.companyName}
                onChange={e => setCompanySettings({ ...companySettings, companyName: e.target.value })}
              />
              <Input
                label="Tax Identification Number"
                value={companySettings.taxId}
                onChange={e => setCompanySettings({ ...companySettings, taxId: e.target.value })}
              />
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Standard Work Days / Week</label>
                <input
                  type="number"
                  value={companySettings.workDaysPerWeek}
                  onChange={e => setCompanySettings({ ...companySettings, workDaysPerWeek: Number(e.target.value) })}
                  className="w-full p-2 border border-slate-200 rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Annual Paid Leave Quota (Days)</label>
                <input
                  type="number"
                  value={companySettings.defaultLeaveQuota}
                  onChange={e => setCompanySettings({ ...companySettings, defaultLeaveQuota: Number(e.target.value) })}
                  className="w-full p-2 border border-slate-200 rounded-lg text-xs"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100">
              <Button type="submit" leftIcon={<Save className="w-3.5 h-3.5" />}>Save Preferences</Button>
            </div>
          </form>
        </Card>
      )}

      {activeTab === 'Notifications' && (
        <Card>
          <CardHeader title="Notification Preferences" subtitle="Manage email and system alert triggers" />
          <form onSubmit={handleSaveUser} className="space-y-4 text-xs mt-4">
            <div className="space-y-3">
              <label className="flex items-center justify-between p-3 bg-slate-50 rounded-xl cursor-pointer">
                <div>
                  <p className="font-semibold text-slate-900">Email Notifications</p>
                  <p className="text-[11px] text-slate-500">Receive email alerts for leave approvals and announcements</p>
                </div>
                <input
                  type="checkbox"
                  checked={userSettings.emailNotifications}
                  onChange={e => setUserSettings({ ...userSettings, emailNotifications: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 rounded"
                />
              </label>

              <label className="flex items-center justify-between p-3 bg-slate-50 rounded-xl cursor-pointer">
                <div>
                  <p className="font-semibold text-slate-900">Push Notifications</p>
                  <p className="text-[11px] text-slate-500">Receive real-time in-app alerts</p>
                </div>
                <input
                  type="checkbox"
                  checked={userSettings.pushNotifications}
                  onChange={e => setUserSettings({ ...userSettings, pushNotifications: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 rounded"
                />
              </label>

              <label className="flex items-center justify-between p-3 bg-slate-50 rounded-xl cursor-pointer">
                <div>
                  <p className="font-semibold text-slate-900">Weekly HR Summary Digest</p>
                  <p className="text-[11px] text-slate-500">Receive weekly workforce attendance and leave statistics</p>
                </div>
                <input
                  type="checkbox"
                  checked={userSettings.weeklyDigest}
                  onChange={e => setUserSettings({ ...userSettings, weeklyDigest: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 rounded"
                />
              </label>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100">
              <Button type="submit" leftIcon={<Save className="w-3.5 h-3.5" />}>Save Preferences</Button>
            </div>
          </form>
        </Card>
      )}

      {activeTab === 'Security' && (
        <Card>
          <CardHeader title="Security & Credentials" subtitle="Update account password" />
          <div className="space-y-4 text-xs mt-4">
            <Input label="Current Password" type="password" placeholder="••••••••" />
            <Input label="New Password" type="password" placeholder="••••••••" />
            <Input label="Confirm New Password" type="password" placeholder="••••••••" />

            <div className="flex justify-end pt-4 border-t border-slate-100">
              <Button onClick={() => toast.success('Password updated successfully!')}>Update Password</Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
