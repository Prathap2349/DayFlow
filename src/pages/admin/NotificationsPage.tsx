// src/pages/admin/NotificationsPage.tsx
import { useState, useEffect } from 'react';
import { Send, Trash2 } from 'lucide-react';
import { Card, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { notificationService } from '../../services/notificationService';
import type { NotificationItem } from '../../types/notification';
import toast from 'react-hot-toast';

export function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const loadNotifications = async () => {
    const list = await notificationService.getNotifications();
    setNotifications(list);
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      toast.error('Please enter announcement title and message.');
      return;
    }
    setLoading(true);
    try {
      await notificationService.addNotification({
        recipientId: 'all',
        type: 'hr_announcement',
        title: title.trim(),
        message: message.trim(),
      });
      toast.success('HR Announcement broadcasted to all employees!');
      setTitle('');
      setMessage('');
      loadNotifications();
    } catch (err) {
      toast.error('Failed broadcasting announcement');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    await notificationService.deleteNotification(id);
    toast.success('Notification removed');
    loadNotifications();
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Broadcast HR Announcements & Alerts</h2>
        <p className="text-xs text-slate-500 mt-0.5">Send company-wide notifications or review system activity logs</p>
      </div>

      <Card>
        <CardHeader title="Broadcast New Announcement" subtitle="Delivered to all employees in real-time" />
        <form onSubmit={handleBroadcast} className="space-y-4 mt-2 text-xs">
          <Input
            label="Announcement Title *"
            placeholder="e.g. Office Holiday Notice / Quarterly All-Hands"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
          />

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Message Content *</label>
            <textarea
              rows={3}
              placeholder="Write announcement details..."
              value={message}
              onChange={e => setMessage(e.target.value)}
              className="w-full p-2.5 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div className="flex justify-end">
            <Button type="submit" isLoading={loading} leftIcon={<Send className="w-3.5 h-3.5" />}>
              Send Announcement
            </Button>
          </div>
        </form>
      </Card>

      <Card padding="none">
        <div className="p-4 border-b border-slate-100">
          <CardHeader title="Recent Notifications Log" subtitle="Broadcasts and system-generated alerts" />
        </div>

        <div className="divide-y divide-slate-100">
          {notifications.map(n => (
            <div key={n.id} className="p-4 flex items-start justify-between gap-4 text-xs">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-slate-900">{n.title}</h4>
                  <span className="text-[10px] text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full font-medium">
                    To: {n.recipientId}
                  </span>
                </div>
                <p className="text-slate-600 mt-1">{n.message}</p>
                <p className="text-[10px] text-slate-400 mt-1.5">{new Date(n.timestamp).toLocaleString()}</p>
              </div>

              <button
                onClick={() => handleDelete(n.id)}
                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
