import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, LayoutDashboard, Users, CalendarCheck, ClipboardList, DollarSign, Megaphone, Bell, Settings, X, ArrowRight, User } from 'lucide-react';
import { useAuth } from '../../auth/useAuth';

interface CommandPaletteModalProps {
  open: boolean;
  onClose: () => void;
}

export function CommandPaletteModal({ open, onClose }: CommandPaletteModalProps) {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();
  const isHr = user?.role === 'hr' || user?.role === 'admin';

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (open) onClose();
        else {
          setQuery('');
        }
      }
      if (e.key === 'Escape' && open) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const hrRoutes = [
    { label: 'Go to HR Dashboard', path: '/admin/dashboard', icon: LayoutDashboard, cat: 'Navigation' },
    { label: 'Manage Workforce Directory', path: '/admin/employees', icon: Users, cat: 'Navigation' },
    { label: 'Workforce Attendance Logs', path: '/admin/attendance', icon: CalendarCheck, cat: 'Navigation' },
    { label: 'Review Leave Requests', path: '/admin/leave', icon: ClipboardList, cat: 'Navigation' },
    { label: 'Payroll & Salary Directory', path: '/admin/payroll', icon: DollarSign, cat: 'Navigation' },
    { label: 'Broadcast Announcements', path: '/admin/announcements', icon: Megaphone, cat: 'Navigation' },
    { label: 'System Settings & Wi-Fi IPs', path: '/admin/settings', icon: Settings, cat: 'Navigation' },
  ];

  const employeeRoutes = [
    { label: 'Go to My Dashboard', path: '/employee/dashboard', icon: LayoutDashboard, cat: 'Navigation' },
    { label: 'My Employee Profile', path: '/employee/profile', icon: User, cat: 'Navigation' },
    { label: 'My Attendance Logs & Punch Card', path: '/employee/attendance', icon: CalendarCheck, cat: 'Navigation' },
    { label: 'Apply for Leave', path: '/employee/leave', icon: ClipboardList, cat: 'Navigation' },
    { label: 'My Payslips & Salary Statements', path: '/employee/payroll', icon: DollarSign, cat: 'Navigation' },
    { label: 'Company Announcement Bulletins', path: '/employee/announcements', icon: Megaphone, cat: 'Navigation' },
    { label: 'View Notifications', path: '/employee/notifications', icon: Bell, cat: 'Navigation' },
  ];

  const routes = isHr ? hrRoutes : employeeRoutes;

  const filtered = routes.filter(r =>
    r.label.toLowerCase().includes(query.toLowerCase()) ||
    r.cat.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (path: string) => {
    navigate(path);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-start justify-center pt-20 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden animate-slide-up">
        {/* Search Header Input */}
        <div className="p-4 border-b border-slate-100 flex items-center gap-3">
          <Search className="w-5 h-5 text-indigo-600 shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder="Type a command or search page (e.g. Leave, Attendance)..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full text-sm bg-transparent border-none focus:outline-none text-slate-900 placeholder-slate-400"
          />
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-100 text-slate-400"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">No matching commands found.</div>
          ) : (
            filtered.map(r => {
              const Icon = r.icon;
              return (
                <button
                  key={r.path}
                  onClick={() => handleSelect(r.path)}
                  className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-indigo-50/80 text-left text-xs font-medium text-slate-800 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span>{r.label}</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-indigo-600 transition-colors" />
                </button>
              );
            })
          )}
        </div>

        {/* Footer shortcuts helper */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <span>Navigate: <kbd className="px-1.5 py-0.5 rounded bg-white border text-[10px]">Ctrl + K</kbd></span>
          <span>Role: <strong className="text-indigo-600 uppercase">{user?.role}</strong></span>
        </div>
      </div>
    </div>
  );
}
