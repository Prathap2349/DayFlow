// src/pages/employee/NotificationsPage.tsx
import { useState, useEffect } from 'react';
import { Check, Trash2 } from 'lucide-react';
import { Card, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../auth/useAuth';
import { notificationService } from '../../services/notificationService';
import type { NotificationItem } from '../../types/notification';
import toast from 'react-hot-toast';

export function EmployeeNotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [filter, setFilter] = useState<'All' | 'Unread'>('All');

  const recipientId = user?.employeeId || user?.id || 'EMP001';

  const loadNotifications = async () => {
    const list = await notificationService.getNotifications(recipientId);
    setNotifications(list);
  };

  useEffect(() => {
    loadNotifications();
  }, [user]);

  const handleMarkRead = async (id: string) => {
    await notificationService.markAsRead(id);
    loadNotifications();
  };

  const handleMarkAllRead = async () => {
    await notificationService.markAllAsRead(recipientId);
    toast.success('All notifications marked as read');
    loadNotifications();
  };

  const handleDelete = async (id: string) => {
    await notificationService.deleteNotification(id);
    toast.success('Notification removed');
    loadNotifications();
  };

  const filtered = notifications.filter(n => (filter === 'Unread' ? !n.read : true));

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Notifications & Alerts</h2>
          <p className="text-xs text-slate-500 mt-0.5">Stay up to date with HR announcements and leave updates</p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" leftIcon={<Check className="w-3.5 h-3.5" />} onClick={handleMarkAllRead}>
            Mark All Read
          </Button>
        </div>
      </div>

      <Card padding="none">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <CardHeader title="All Notifications" subtitle={`${notifications.filter(n => !n.read).length} unread`} />
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
            {(['All', 'Unread'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                  filter === f ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">No notifications found.</div>
          ) : (
            filtered.map(n => (
              <div
                key={n.id}
                className={`p-4 flex items-start justify-between gap-4 hover:bg-slate-50 transition-colors ${
                  !n.read ? 'bg-indigo-50/40' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${!n.read ? 'bg-indigo-600' : 'bg-slate-300'}`} />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{n.title}</h4>
                    <p className="text-xs text-slate-600 mt-0.5">{n.message}</p>
                    <p className="text-[10px] text-slate-400 mt-1">
                      {new Date(n.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {!n.read && (
                    <button
                      onClick={() => handleMarkRead(n.id)}
                      className="p-1 text-xs text-indigo-600 hover:bg-indigo-50 rounded"
                      title="Mark as Read"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(n.id)}
                    className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
