import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AdminSidebar } from '../components/sidebar/AdminSidebar';
import { DashboardHeader } from '../components/header/DashboardHeader';
import { CommandPaletteModal } from '../components/shared/CommandPaletteModal';

const PAGE_TITLES: Record<string, string> = {
  '/admin/dashboard': 'Dashboard',
  '/admin/employees': 'Employees',
  '/admin/attendance': 'Attendance',
  '/admin/leave': 'Leave Approvals',
  '/admin/payroll': 'Payroll',
  '/admin/announcements': 'Announcements',
  '/admin/reports': 'Reports',
  '/admin/notifications': 'Notifications',
  '/admin/settings': 'Settings',
};

export function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);
  const location = useLocation();
  const title = PAGE_TITLES[location.pathname] ?? 'Dashboard';

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden">
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <DashboardHeader
          title={title}
          onMenuToggle={() => setSidebarOpen(true)}
          onCommandPaletteOpen={() => setCmdOpen(true)}
        />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 animate-fade-in">
          <Outlet />
        </main>
      </div>

      <CommandPaletteModal open={cmdOpen} onClose={() => setCmdOpen(false)} />
    </div>
  );
}
