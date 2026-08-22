// src/pages/admin/AttendancePage.tsx
import { useState, useEffect } from 'react';
import { Search, Filter } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { StatusBadge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { attendanceService } from '../../services/attendanceService';
import type { AttendanceRecord } from '../../types/attendance';

const DEPARTMENTS = ['All', 'Engineering', 'Design', 'Marketing', 'Finance', 'Human Resources'];
const STATUSES = ['All', 'Present', 'Absent', 'Half Day', 'On Leave'];

export function AdminAttendancePage() {
  const [attendanceLogs, setAttendanceLogs] = useState<AttendanceRecord[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [deptFilter, setDeptFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'Daily' | 'Weekly' | 'Monthly'>('Daily');

  const loadData = async () => {
    const records = await attendanceService.getAllAttendance(viewMode === 'Daily' ? selectedDate : undefined);
    setAttendanceLogs(records);
  };

  useEffect(() => {
    loadData();
  }, [selectedDate, viewMode]);

  const filtered = attendanceLogs.filter(item => {
    const matchSearch =
      item.employeeName.toLowerCase().includes(search.toLowerCase()) ||
      item.employeeId.toLowerCase().includes(search.toLowerCase()) ||
      item.department.toLowerCase().includes(search.toLowerCase());
    const matchDept = deptFilter === 'All' || item.department === deptFilter;
    const matchStatus = statusFilter === 'All' || item.status === statusFilter;
    return matchSearch && matchDept && matchStatus;
  });

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Attendance Monitoring</h2>
          <p className="text-xs text-slate-500 mt-0.5">Track real-time check-ins, check-outs, and shift hours across teams</p>
        </div>

        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-fit">
          {(['Daily', 'Weekly', 'Monthly'] as const).map(mode => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === mode ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      <Card padding="none">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div className="relative">
              <input
                type="date"
                value={selectedDate}
                onChange={e => setSelectedDate(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white font-medium text-slate-700"
              />
            </div>

            <div className="flex items-center gap-1 text-xs text-slate-500 font-medium">
              <Filter className="w-3.5 h-3.5" /> Dept:
            </div>
            <select
              value={deptFilter}
              onChange={e => setDeptFilter(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
            >
              {DEPARTMENTS.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>

            <span className="text-xs text-slate-500 font-medium">Status:</span>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
            >
              {STATUSES.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search employee or ID..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-slate-500 uppercase tracking-wider text-[11px] font-semibold">
                <th className="text-left px-5 py-3">Employee</th>
                <th className="text-left px-4 py-3">Department</th>
                <th className="text-left px-4 py-3">Date</th>
                <th className="text-left px-4 py-3">Check In</th>
                <th className="text-left px-4 py-3">Check Out</th>
                <th className="text-left px-4 py-3">Working Hours</th>
                <th className="text-left px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    No attendance records found for this date and filter.
                  </td>
                </tr>
              ) : (
                filtered.map(rec => (
                  <tr key={rec.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <Avatar name={rec.employeeName} size="sm" />
                        <div>
                          <p className="font-semibold text-slate-900">{rec.employeeName}</p>
                          <p className="text-[11px] text-slate-400">{rec.employeeId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-slate-600">{rec.department}</td>
                    <td className="px-4 py-3.5 text-slate-700">{rec.date}</td>
                    <td className="px-4 py-3.5 font-medium text-slate-800">{rec.checkInTime || '—'}</td>
                    <td className="px-4 py-3.5 text-slate-600">{rec.checkOutTime || '—'}</td>
                    <td className="px-4 py-3.5 font-bold text-slate-800">
                      {rec.workingHours ? `${rec.workingHours} hrs` : '—'}
                    </td>
                    <td className="px-4 py-3.5"><StatusBadge status={rec.status} /></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
