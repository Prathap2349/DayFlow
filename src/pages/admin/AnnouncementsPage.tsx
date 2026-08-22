// src/pages/admin/AnnouncementsPage.tsx
import { useState, useEffect } from 'react';
import { Megaphone, Pin, Trash2, Send } from 'lucide-react';
import { Card, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { announcementService } from '../../services/announcementService';
import type { Announcement, AnnouncementCategory } from '../../types/announcement';
import { useAuth } from '../../auth/useAuth';
import toast from 'react-hot-toast';

export function AdminAnnouncementsPage() {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<AnnouncementCategory>('General');
  const [isPinned, setIsPinned] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const loadAnnouncements = async () => {
    setLoading(true);
    const data = await announcementService.getAnnouncements();
    setAnnouncements(data);
    setLoading(false);
  };

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      toast.error('Please fill in both title and announcement details.');
      return;
    }

    setSubmitting(true);
    try {
      await announcementService.createAnnouncement({
        title: title.trim(),
        content: content.trim(),
        category,
        isPinned,
        authorName: user?.name || 'HR Operations',
      });

      toast.success('Announcement broadcasted to all employees!');
      setTitle('');
      setContent('');
      setIsPinned(false);
      setCategory('General');
      loadAnnouncements();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to publish announcement');
    } finally {
      setSubmitting(false);
    }
  };

  const handleTogglePin = async (id: string, currentPinStatus: boolean) => {
    try {
      await announcementService.togglePin(id, currentPinStatus);
      setAnnouncements(prev =>
        prev.map(a => (a.id === id ? { ...a, isPinned: !currentPinStatus } : a))
      );
      toast.success(currentPinStatus ? 'Unpinned announcement' : 'Pinned to top of employee feed');
    } catch (err) {
      toast.error('Failed to update pin status');
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (window.confirm(`Delete announcement "${title}"?`)) {
      try {
        await announcementService.deleteAnnouncement(id);
        setAnnouncements(prev => prev.filter(a => a.id !== id));
        toast.success('Announcement deleted');
      } catch (err) {
        toast.error('Failed to delete announcement');
      }
    }
  };

  const getCategoryBadge = (cat: AnnouncementCategory) => {
    switch (cat) {
      case 'Urgent':
        return <Badge variant="danger" dot>🚨 Urgent</Badge>;
      case 'Event':
        return <Badge variant="warning">🎉 Event</Badge>;
      case 'Policy':
        return <Badge variant="info">📜 Policy Update</Badge>;
      default:
        return <Badge variant="default">📢 General</Badge>;
    }
  };

  return (
    <div className="space-y-6 max-w-6xl animate-fade-in">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Company Announcements & Broadcasts</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Publish company-wide announcements, policy updates, and event notifications to the employee feed.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Create Broadcast Form */}
        <Card className="lg:col-span-1 border border-indigo-100/80 shadow-md shadow-indigo-50/50 rounded-2xl">
          <CardHeader title="Create New Broadcast" subtitle="Publish to employee portals" />
          <form onSubmit={handleCreateAnnouncement} className="space-y-4 text-xs mt-4">
            <Input
              label="Announcement Title *"
              placeholder="e.g. Q3 Townhall Meeting"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
            />

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Category *</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as AnnouncementCategory)}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="General">📢 General Announcement</option>
                <option value="Urgent">🚨 Urgent / Priority</option>
                <option value="Event">🎉 Event / Townhall</option>
                <option value="Policy">📜 HR & Office Policy</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Announcement Message *</label>
              <textarea
                rows={5}
                placeholder="Type the message to broadcast to all employees..."
                value={content}
                onChange={e => setContent(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none"
                required
              />
            </div>

            <label className="flex items-center gap-2 p-3 bg-indigo-50/60 rounded-xl cursor-pointer border border-indigo-100">
              <input
                type="checkbox"
                checked={isPinned}
                onChange={e => setIsPinned(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded"
              />
              <div>
                <p className="font-bold text-indigo-950 flex items-center gap-1">
                  <Pin className="w-3.5 h-3.5 text-indigo-600" /> Pin to Top of Employee Feed
                </p>
                <p className="text-[10px] text-indigo-700">Keep this announcement highlighted at the top of the feed</p>
              </div>
            </label>

            <Button type="submit" fullWidth isLoading={submitting} leftIcon={<Send className="w-4 h-4" />}>
              Publish Announcement
            </Button>
          </form>
        </Card>

        {/* Live Announcements Feed */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-indigo-600" /> Active Announcements ({announcements.length})
            </h3>
          </div>

          {loading ? (
            <div className="p-8 text-center text-xs text-slate-400">Loading broadcasts...</div>
          ) : announcements.length === 0 ? (
            <Card className="p-8 text-center text-xs text-slate-400">No active announcements broadcasted yet.</Card>
          ) : (
            <div className="space-y-4">
              {announcements.map(item => (
                <Card
                  key={item.id}
                  className={`transition-all duration-200 rounded-2xl ${
                    item.isPinned ? 'border-2 border-indigo-500/40 bg-indigo-50/20 shadow-md' : 'border border-slate-100 shadow-sm'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-slate-100">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        {item.isPinned && (
                          <span className="px-2 py-0.5 rounded-full bg-indigo-600 text-white text-[10px] font-extrabold flex items-center gap-1">
                            <Pin className="w-3 h-3 fill-current" /> PINNED
                          </span>
                        )}
                        {getCategoryBadge(item.category)}
                      </div>
                      <h4 className="text-base font-bold text-slate-900 pt-1">{item.title}</h4>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        size="sm"
                        variant={item.isPinned ? 'primary' : 'outline'}
                        onClick={() => handleTogglePin(item.id, item.isPinned)}
                        leftIcon={<Pin className="w-3.5 h-3.5" />}
                      >
                        {item.isPinned ? 'Unpin' : 'Pin to Top'}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-600 hover:bg-red-50 hover:text-red-700"
                        onClick={() => handleDelete(item.id, item.title)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="pt-3 text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                    {item.content}
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-medium">
                    <span>By: <strong className="text-slate-700">{item.authorName}</strong></span>
                    <span>{item.createdAt}</span>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
