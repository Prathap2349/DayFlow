// src/layouts/EmployeeLayout.tsx
import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { EmployeeSidebar } from '../components/sidebar/EmployeeSidebar';
import { DashboardHeader } from '../components/header/DashboardHeader';
import { useLocation } from 'react-router-dom';

const PAGE_TITLES: Record<string, string> = {
  '/employee/dashboard': 'Dashboard',
  '/employee/profile': 'My Profile',
  '/employee/attendance': 'Attendance',
  '/employee/leave': 'Leave Requests',
  '/employee/notifications': 'Notifications',
};

export function EmployeeLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const title = PAGE_TITLES[location.pathname] ?? 'Dashboard';

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <EmployeeSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <DashboardHeader title={title} onMenuToggle={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
