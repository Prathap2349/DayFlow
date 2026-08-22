// src/pages/employee/AnnouncementsPage.tsx
import { useState, useEffect } from 'react';
import { Megaphone, Pin, Sparkles } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { announcementService } from '../../services/announcementService';
import type { Announcement, AnnouncementCategory } from '../../types/announcement';

const CATEGORIES: ('All' | AnnouncementCategory)[] = ['All', 'Urgent', 'Event', 'Policy', 'General'];

export function EmployeeAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<'All' | AnnouncementCategory>('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    announcementService.getAnnouncements().then(data => {
      setAnnouncements(data);
      setLoading(false);
    });
  }, []);

  const filtered = announcements.filter(
    a => selectedCategory === 'All' || a.category === selectedCategory
  );

  const pinnedItems = announcements.filter(a => a.isPinned);

  const getCategoryBadge = (cat: AnnouncementCategory) => {
    switch (cat) {
      case 'Urgent':
        return <Badge variant="danger" dot>🚨 Urgent Notice</Badge>;
      case 'Event':
        return <Badge variant="warning">🎉 Company Event</Badge>;
      case 'Policy':
        return <Badge variant="info">📜 Policy Update</Badge>;
      default:
        return <Badge variant="default">📢 Announcement</Badge>;
    }
  };

  return (
    <div className="space-y-6 max-w-5xl animate-fade-in">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Company Announcements & Bulletins</h2>
        <p className="text-xs text-slate-500 mt-0.5">Stay updated with official organization notices, policy updates, and team events</p>
      </div>

      {/* Pinned Highlights Carousel / Section */}
      {pinnedItems.length > 0 && selectedCategory === 'All' && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-indigo-950 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500" /> Pinned Announcements
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pinnedItems.map(pin => (
              <div
                key={pin.id}
                className="p-5 rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 text-white shadow-lg shadow-indigo-200/50 relative overflow-hidden flex flex-col justify-between"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="px-2 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                      <Pin className="w-3 h-3 fill-white" /> Pinned
                    </span>
                    <span className="text-[11px] text-indigo-200">{pin.createdAt}</span>
                  </div>
                  <h4 className="text-base font-bold text-white mb-2 leading-snug">{pin.title}</h4>
                  <p className="text-xs text-indigo-100 leading-relaxed line-clamp-3">{pin.content}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-white/15 flex items-center justify-between text-[11px] text-indigo-200 font-medium">
                  <span>By: {pin.authorName}</span>
                  <span className="bg-white/15 px-2 py-0.5 rounded text-[10px] text-white font-semibold">{pin.category}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Feed Card & Filters */}
      <Card padding="none">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Megaphone className="w-4 h-4 text-indigo-600" />
            <span className="font-bold text-slate-800">All Company Broadcasts</span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-150 shrink-0 ${
                  selectedCategory === cat
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {cat === 'All' ? 'All Bulletins' : cat}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 space-y-4">
          {loading ? (
            <div className="p-8 text-center text-xs text-slate-400">Loading company announcements...</div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">No announcements found for category "{selectedCategory}".</div>
          ) : (
            filtered.map(item => (
              <div
                key={item.id}
                className="p-5 rounded-2xl border border-slate-100 bg-white hover:border-indigo-200 hover:shadow-md transition-all duration-200 space-y-3"
              >
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    {item.isPinned && (
                      <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-bold flex items-center gap-1">
                        <Pin className="w-3 h-3 text-indigo-600" /> Pinned
                      </span>
                    )}
                    {getCategoryBadge(item.category)}
                  </div>
                  <span className="text-xs text-slate-400 font-medium">{item.createdAt}</span>
                </div>

                <h3 className="text-base font-bold text-slate-900 leading-tight">{item.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">{item.content}</p>

                <div className="pt-2 border-t border-slate-50 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Issued by: <strong className="text-slate-700 font-semibold">{item.authorName}</strong></span>
                  <span>Target: <strong className="text-slate-600">{item.targetDepartment || 'All Employees'}</strong></span>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
