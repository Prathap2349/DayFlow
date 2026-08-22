// src/components/header/DashboardHeader.tsx
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Search, Bell, User as UserIcon, Settings, LogOut, Check, X, Building, Mail } from 'lucide-react';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';
import { useAuth } from '../../auth/useAuth';
import { notificationService } from '../../services/notificationService';
import { employeeService } from '../../services/employeeService';
import type { NotificationItem } from '../../types/notification';
import type { Employee } from '../../types/employee';
import toast from 'react-hot-toast';

interface DashboardHeaderProps {
  title: string;
  onMenuToggle: () => void;
  onCommandPaletteOpen?: () => void;
}

export function DashboardHeader({ title, onMenuToggle, onCommandPaletteOpen }: DashboardHeaderProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Dropdown states
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // Data states
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Employee[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const recipientId = user?.employeeId ?? user?.id ?? 'all';

  const loadNotifications = async () => {
    if (!user) return;
    const list = await notificationService.getNotifications(recipientId);
    setNotifications(list.slice(0, 6));
    const count = await notificationService.getUnreadCount(recipientId);
    setUnreadCount(count);
  };

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 5000);
    return () => clearInterval(interval);
  }, [user]);

  // Handle Search Input
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    employeeService.getEmployees().then(list => {
      const q = searchQuery.toLowerCase();
      const filtered = list.filter(
        e =>
          e.name.toLowerCase().includes(q) ||
          e.email.toLowerCase().includes(q) ||
          e.employeeId.toLowerCase().includes(q) ||
          e.department.toLowerCase().includes(q) ||
          e.jobTitle.toLowerCase().includes(q)
      );
      setSearchResults(filtered);
    });
  }, [searchQuery]);

  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
  }, [searchOpen]);

  const handleMarkAllRead = async () => {
    await notificationService.markAllAsRead(recipientId);
    toast.success('All notifications marked as read');
    loadNotifications();
  };

  const handleNotificationClick = async (notif: NotificationItem) => {
    await notificationService.markAsRead(notif.id);
    setNotificationsOpen(false);
    loadNotifications();
    if (notif.link) navigate(notif.link);
  };

  const handleLogout = () => {
    logout();
    toast.success('You have been logged out.');
    navigate('/login');
  };

  return (
    <>
      <header className="sticky top-0 z-20 flex items-center gap-3 px-4 sm:px-6 h-16 bg-white/95 backdrop-blur border-b border-slate-100 text-slate-900">
        {/* Mobile hamburger */}
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 rounded-lg hover:bg-slate-100 text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          aria-label="Open navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Title */}
        <h1 className="text-lg font-semibold text-slate-900 flex-1 min-w-0 truncate">{title}</h1>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Global Search / Command Palette Button */}
          <button
            onClick={() => onCommandPaletteOpen ? onCommandPaletteOpen() : setSearchOpen(true)}
            className="flex items-center gap-2 p-2 sm:px-3 sm:py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 text-sm transition-all shadow-sm focus-visible:outline-none"
            aria-label="Global Search"
          >
            <Search className="w-4 h-4 text-indigo-600" />
            <span className="hidden sm:inline text-xs font-medium text-slate-600">Search (Ctrl+K)</span>
          </button>

          {/* Notifications Bell Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setNotificationsOpen(!notificationsOpen);
                setProfileOpen(false);
              }}
              className="relative p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              aria-label="Notifications"
              aria-expanded={notificationsOpen}
            >
              <Bell style={{ width: 18, height: 18 }} />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
                </span>
              )}
            </button>

            {/* Notification Dropdown Panel */}
            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-100 z-50 animate-fade-in">
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-slate-900">Notifications</h3>
                    {unreadCount > 0 && <Badge variant="danger">{unreadCount} new</Badge>}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
                    >
                      <Check className="w-3 h-3" /> Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-50">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-600">
                      No notifications yet.
                    </div>
                  ) : (
                    notifications.map(n => (
                      <div
                        key={n.id}
                        onClick={() => handleNotificationClick(n)}
                        className={`p-3.5 hover:bg-slate-50 transition-colors cursor-pointer flex items-start gap-3 ${
                          !n.read ? 'bg-indigo-50/40' : ''
                        }`}
                      >
                        <div
                          className={`w-2 h-2 rounded-full mt-2 shrink-0 ${
                            !n.read ? 'bg-indigo-600' : 'bg-slate-300'
                          }`}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-slate-800">{n.title}</p>
                          <p className="text-xs text-slate-600 mt-0.5 line-clamp-2">{n.message}</p>
                          <p className="text-[10px] text-slate-600 mt-1">
                            {new Date(n.timestamp).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="p-2 border-t border-slate-100 text-center">
                  <button
                    onClick={() => {
                      setNotificationsOpen(false);
                      navigate(user?.role === 'admin' ? '/admin/notifications' : '/employee/notifications');
                    }}
                    className="text-xs font-medium text-indigo-600 hover:text-indigo-700 py-1"
                  >
                    View all notifications →
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setProfileOpen(!profileOpen);
                setNotificationsOpen(false);
              }}
              className="flex items-center gap-2.5 ml-1 p-1 rounded-lg hover:bg-slate-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              aria-expanded={profileOpen}
            >
              <Avatar name={user?.name ?? 'User'} size="md" />
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-slate-900 leading-none">{user?.name}</p>
                <div className="mt-1">
                  <Badge variant={user?.role === 'admin' ? 'purple' : 'info'} className="text-[10px] px-2 py-0">
                    {user?.role === 'admin' ? 'HR / Admin' : 'Employee'}
                  </Badge>
                </div>
              </div>
            </button>

            {/* Profile Dropdown Menu */}
            {profileOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 py-1 z-50 animate-fade-in">
                <div className="px-4 py-3 border-b border-slate-100">
                  <p className="text-sm font-semibold text-slate-900">{user?.name}</p>
                  <p className="text-xs text-slate-600 truncate">{user?.email}</p>
                </div>

                <button
                  onClick={() => {
                    setProfileOpen(false);
                    navigate(user?.role === 'admin' ? '/admin/employees' : '/employee/profile');
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <UserIcon className="w-4 h-4 text-slate-600" />
                  View Profile
                </button>

                <button
                  onClick={() => {
                    setProfileOpen(false);
                    navigate(user?.role === 'admin' ? '/admin/settings' : '/employee/profile');
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <Settings className="w-4 h-4 text-slate-600" />
                  Settings
                </button>

                <div className="border-t border-slate-100 my-1" />

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Global Search Modal */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-start justify-center pt-16 px-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-xl overflow-hidden animate-fade-in">
            <div className="flex items-center px-4 border-b border-slate-100">
              <Search className="w-5 h-5 text-slate-600 mr-2 shrink-0" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search employees by name, ID, department..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full py-4 text-sm text-slate-900 bg-transparent focus:outline-none placeholder:text-slate-600"
              />
              <button
                onClick={() => setSearchOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-600 shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-96 overflow-y-auto p-2">
              {!searchQuery.trim() ? (
                <div className="p-8 text-center text-xs text-slate-600">
                  Type a keyword to search across Dayflow employees & records.
                </div>
              ) : searchResults.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-600">
                  No records matching "{searchQuery}".
                </div>
              ) : (
                searchResults.map(emp => (
                  <div
                    key={emp.id}
                    onClick={() => {
                      setSearchOpen(false);
                      navigate(user?.role === 'admin' ? '/admin/employees' : '/employee/profile');
                    }}
                    className="flex items-center gap-3 p-3 hover:bg-indigo-50/50 rounded-xl cursor-pointer transition-colors"
                  >
                    <Avatar name={emp.name} size="md" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-slate-900 truncate">{emp.name}</p>
                        <Badge variant="default" className="text-[10px]">
                          {emp.employeeId}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-600 mt-0.5">
                        <span className="flex items-center gap-1">
                          <Building className="w-3 h-3 text-slate-600" /> {emp.department}
                        </span>
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3 text-slate-600" /> {emp.email}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
