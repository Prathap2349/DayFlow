// src/pages/admin/SettingsPage.tsx
import { useState, useEffect } from 'react';
import { Save, Wifi, Plus, Trash2, Globe } from 'lucide-react';
import { Card, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { settingsService } from '../../services/settingsService';
import { officeService, type OfficeLocation } from '../../services/officeService';
import type { UserSettings, CompanySettings } from '../../types/settings';
import toast from 'react-hot-toast';

export function AdminSettingsPage() {
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null);
  const [companySettings, setCompanySettings] = useState<CompanySettings | null>(null);
  const [officeLocations, setOfficeLocations] = useState<OfficeLocation[]>([]);
  const [myCurrentIp, setMyCurrentIp] = useState<string>('Detecting...');
  const [newOfficeName, setNewOfficeName] = useState('');
  const [newOfficeIp, setNewOfficeIp] = useState('');
  const [activeTab, setActiveTab] = useState<'General' | 'Network' | 'Notifications' | 'Security'>('General');

  useEffect(() => {
    settingsService.getUserSettings().then(setUserSettings);
    settingsService.getCompanySettings().then(setCompanySettings);
    officeService.getOfficeLocations().then(setOfficeLocations);
    officeService.getClientIp().then(setMyCurrentIp);
  }, []);

  const handleAddOfficeIp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOfficeName.trim() || !newOfficeIp.trim()) {
      toast.error('Please enter both office name and allowed IP.');
      return;
    }
    try {
      const saved = await officeService.saveOfficeLocation({
        name: newOfficeName.trim(),
        allowedIpAddresses: newOfficeIp.split(',').map(ip => ip.trim()),
      });
      setOfficeLocations(prev => [...prev.filter(o => o.id !== saved.id), saved]);
      setNewOfficeName('');
      setNewOfficeIp('');
      toast.success('Office network rule saved!');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save rule');
    }
  };

  const handleDeleteOffice = async (id: string) => {
    try {
      await officeService.deleteOfficeLocation(id);
      setOfficeLocations(prev => prev.filter(o => o.id !== id));
      toast.success('Office network rule deleted');
    } catch (err) {
      toast.error('Failed to delete office location');
    }
  };

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
        {(['General', 'Network', 'Notifications', 'Security'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-2.5 transition-colors ${
              activeTab === tab
                ? 'border-b-2 border-indigo-600 text-indigo-600'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {tab === 'Network' ? 'Office Wi-Fi & IPs' : `${tab} Settings`}
          </button>
        ))}
      </div>

      {activeTab === 'Network' && (
        <div className="space-y-6">
          <Card>
            <CardHeader
              title="Office Wi-Fi & Approved IP Addresses"
              subtitle="Employees on 'Office' mode must be connected to these public IP addresses to punch in."
            />
            <div className="mt-4 p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl flex items-center justify-between text-xs text-indigo-900">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>Your Current Public Network IP Address: <strong className="font-mono text-indigo-700">{myCurrentIp}</strong></span>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setNewOfficeName('Current Device Network');
                  setNewOfficeIp(myCurrentIp);
                }}
              >
                Use My Current IP
              </Button>
            </div>

            <form onSubmit={handleAddOfficeIp} className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <Input
                label="Office Location Name"
                placeholder="e.g. HQ Main Office"
                value={newOfficeName}
                onChange={e => setNewOfficeName(e.target.value)}
              />
              <Input
                label="Allowed Public IP (or * for all)"
                placeholder="e.g. 103.21.12.44 or *"
                value={newOfficeIp}
                onChange={e => setNewOfficeIp(e.target.value)}
              />
              <div className="flex items-end">
                <Button type="submit" fullWidth leftIcon={<Plus className="w-4 h-4" />}>
                  Add Approved IP Rule
                </Button>
              </div>
            </form>

            <div className="mt-6 space-y-3">
              <h4 className="font-semibold text-xs text-slate-800">Configured Office Networks:</h4>
              {officeLocations.length === 0 ? (
                <p className="text-xs text-slate-400">No office IP rules added yet.</p>
              ) : (
                <div className="space-y-2">
                  {officeLocations.map(loc => (
                    <div
                      key={loc.id}
                      className="flex items-center justify-between p-3 border border-slate-200 rounded-xl text-xs bg-slate-50/50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                          <Wifi className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{loc.name}</p>
                          <p className="font-mono text-[11px] text-slate-500">
                            Allowed IPs: {loc.allowedIpAddresses.join(', ') || 'All (*)'}
                          </p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDeleteOffice(loc.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

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
