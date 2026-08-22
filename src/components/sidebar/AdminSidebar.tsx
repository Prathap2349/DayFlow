// src/components/sidebar/AdminSidebar.tsx
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  ClipboardList,
  DollarSign,
  BarChart3,
  Megaphone,
  Bell,
  Settings,
  LogOut,
  X,
} from 'lucide-react';
import { clsx } from 'clsx';
import { useAuth } from '../../auth/useAuth';
import { Avatar } from '../ui/Avatar';
import { DayflowLogo } from '../shared/DayflowLogo';
import toast from 'react-hot-toast';

const navItems = [
  { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/employees', icon: Users, label: 'Employees' },
  { to: '/admin/attendance', icon: CalendarCheck, label: 'Attendance' },
  { to: '/admin/leave', icon: ClipboardList, label: 'Leave Approvals' },
  { to: '/admin/payroll', icon: DollarSign, label: 'Payroll' },
  { to: '/admin/announcements', icon: Megaphone, label: 'Announcements' },
  { to: '/admin/reports', icon: BarChart3, label: 'Reports' },
  { to: '/admin/notifications', icon: Bell, label: 'Notifications' },
];

interface AdminSidebarProps {
  open: boolean;
  onClose: () => void;
}

export function AdminSidebar({ open, onClose }: AdminSidebarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('You have been logged out.');
    navigate('/login');
  };

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/30 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={clsx(
          'fixed top-0 left-0 z-40 h-full w-64 bg-white border-r border-slate-100 flex flex-col',
          'transition-transform duration-250 ease-in-out',
          'lg:translate-x-0 lg:static lg:z-auto',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
        aria-label="Admin navigation"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-slate-100">
          <DayflowLogo size="md" />
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg hover:bg-slate-100 text-slate-400"
            aria-label="Close navigation"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150',
                  isActive
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className={clsx('shrink-0', isActive ? 'text-indigo-600' : 'text-slate-400')}
                    style={{ width: 18, height: 18 }}
                  />
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-3 py-4 border-t border-slate-100 space-y-0.5">
          <NavLink
            to="/admin/settings"
            onClick={onClose}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
          >
            <Settings style={{ width: 18, height: 18 }} className="text-slate-400" />
            Settings
          </NavLink>

          <div className="flex items-center gap-3 px-2 py-2">
            <Avatar name={user?.name ?? 'Admin'} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">{user?.name}</p>
              <p className="text-xs text-slate-400 truncate">HR Administrator</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors duration-150"
          >
            <LogOut style={{ width: 18, height: 18 }} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
