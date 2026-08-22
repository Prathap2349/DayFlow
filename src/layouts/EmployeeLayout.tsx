import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { EmployeeSidebar } from '../components/sidebar/EmployeeSidebar';
import { DashboardHeader } from '../components/header/DashboardHeader';
import { CommandPaletteModal } from '../components/shared/CommandPaletteModal';

const PAGE_TITLES: Record<string, string> = {
  '/employee/dashboard': 'Dashboard',
  '/employee/profile': 'My Profile',
  '/employee/attendance': 'Attendance',
  '/employee/leave': 'Leave Requests',
  '/employee/announcements': 'Announcements',
  '/employee/notifications': 'Notifications',
};

export function EmployeeLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);
  const location = useLocation();
  const title = PAGE_TITLES[location.pathname] ?? 'Dashboard';

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden">
      <EmployeeSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

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
