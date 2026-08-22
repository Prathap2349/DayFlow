// src/components/sidebar/EmployeeSidebar.tsx
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  User,
  CalendarCheck,
  ClipboardList,
  DollarSign,
  Bell,
  LogOut,
  X,
} from 'lucide-react';
import { clsx } from 'clsx';
import { useAuth } from '../../auth/useAuth';
import { Avatar } from '../ui/Avatar';
import { DayflowLogo } from '../shared/DayflowLogo';
import toast from 'react-hot-toast';

const navItems = [
  { to: '/employee/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/employee/profile', icon: User, label: 'My Profile' },
  { to: '/employee/attendance', icon: CalendarCheck, label: 'Attendance' },
  { to: '/employee/leave', icon: ClipboardList, label: 'Leave Requests' },
  { to: '/employee/payroll', icon: DollarSign, label: 'Payroll & Slips' },
  { to: '/employee/notifications', icon: Bell, label: 'Notifications' },
];

interface EmployeeSidebarProps {
  open: boolean;
  onClose: () => void;
}

export function EmployeeSidebar({ open, onClose }: EmployeeSidebarProps) {
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
        aria-label="Employee navigation"
      >
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
                    className={clsx(
                      'w-4.5 h-4.5 shrink-0',
                      isActive ? 'text-indigo-600' : 'text-slate-400'
                    )}
                    style={{ width: 18, height: 18 }}
                  />
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-slate-100">
          <div className="flex items-center gap-3 px-2 py-2 mb-2">
            <Avatar name={user?.name ?? 'User'} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">{user?.name}</p>
              <p className="text-xs text-slate-400 truncate">{user?.employeeId}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors duration-150"
          >
            <LogOut className="shrink-0" style={{ width: 18, height: 18 }} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
