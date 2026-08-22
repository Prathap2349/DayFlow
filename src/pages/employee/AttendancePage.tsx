// src/pages/employee/AttendancePage.tsx
import { useState, useEffect } from 'react';
import { CalendarCheck, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { Card, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/Badge';
import { StatCard } from '../../components/shared/StatCard';
import { useAuth } from '../../auth/useAuth';
import { attendanceService } from '../../services/attendanceService';
import type { AttendanceRecord } from '../../types/attendance';
import toast from 'react-hot-toast';

export function EmployeeAttendancePage() {
  const { user } = useAuth();
  const [todayRecord, setTodayRecord] = useState<AttendanceRecord | null>(null);
  const [history, setHistory] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(false);

  const empId = user?.employeeId || 'EMP001';

  const loadData = async () => {
    const today = await attendanceService.getTodayRecord(empId);
    setTodayRecord(today);
    const hist = await attendanceService.getEmployeeAttendanceHistory(empId);
    setHistory(hist);
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleCheckIn = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const rec = await attendanceService.checkIn({
        id: user.id,
        employeeId: empId,
        firstName: user.name.split(' ')[0],
        lastName: user.name.split(' ')[1] || '',
        name: user.name,
        email: user.email,
        phone: '',
        department: user.department || 'Engineering',
        jobTitle: user.jobTitle || 'Software Engineer',
        status: 'Active',
        joinDate: '2022-03-15',
        attendanceRate: 92,
        leaveBalance: 12,
        role: user.role as any,
      });
      setTodayRecord(rec);
      toast.success('Successfully checked in for today! Status: Present');
      loadData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Check in failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setLoading(true);
    try {
      const rec = await attendanceService.checkOut(empId);
      setTodayRecord(rec);
      toast.success(`Successfully checked out! Worked: ${rec.workingHours} hours.`);
      loadData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Check out failed');
    } finally {
      setLoading(false);
    }
  };

  const isCheckedIn = !!todayRecord?.checkInTime;
  const isCheckedOut = !!todayRecord?.checkOutTime;

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Top Banner / Today's Punch Card */}
      <Card className="p-6 bg-white border border-slate-100 shadow-sm rounded-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
              <CalendarCheck className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">Today's Attendance</h2>
                <StatusBadge status={todayRecord?.status ?? 'Absent'} />
              </div>
              <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                <span>Date: {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}</span>
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <Button
              size="lg"
              disabled={isCheckedIn || loading}
              onClick={handleCheckIn}
              leftIcon={<Clock className="w-4 h-4" />}
            >
              {isCheckedIn ? `Checked In at ${todayRecord.checkInTime}` : 'Check In'}
            </Button>

            <Button
              size="lg"
              variant="secondary"
              disabled={!isCheckedIn || isCheckedOut || loading}
              onClick={handleCheckOut}
            >
              {isCheckedOut ? `Checked Out at ${todayRecord.checkOutTime}` : 'Check Out'}
            </Button>
          </div>
        </div>

        {/* Live Working Duration Indicator */}
        {isCheckedIn && (
          <div className="mt-5 p-4 rounded-xl bg-indigo-50/70 border border-indigo-100 flex items-center justify-between text-xs text-indigo-900">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Shift active since <strong>{todayRecord.checkInTime}</strong></span>
            </div>
            {todayRecord.workingHours && (
              <span className="font-semibold text-indigo-700">Total Recorded Duration: {todayRecord.workingHours} hrs</span>
            )}
          </div>
        )}
      </Card>

      {/* Monthly Attendance Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Days Present"
          value="18 days"
          subtext="This month"
          icon={<CheckCircle2 className="w-5 h-5" />}
          iconBg="bg-emerald-50 text-emerald-600"
        />
        <StatCard
          label="Average Working Hours"
          value="8.4 hrs/day"
          subtext="Standard 8.0 hrs"
          icon={<Clock className="w-5 h-5" />}
          iconBg="bg-indigo-50 text-indigo-600"
        />
        <StatCard
          label="Leave & Absences"
          value="2 days"
          subtext="1 Approved Leave, 1 Absent"
          icon={<AlertCircle className="w-5 h-5" />}
          iconBg="bg-amber-50 text-amber-600"
        />
      </div>

      {/* Attendance History Table */}
      <Card padding="none">
        <div className="px-5 py-4 border-b border-slate-100">
          <CardHeader title="Attendance Logs" subtitle="Your recent check-in and check-out history" />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-slate-500 uppercase tracking-wider text-[11px] font-semibold">
                <th className="text-left px-5 py-3">Date</th>
                <th className="text-left px-4 py-3">Check In</th>
                <th className="text-left px-4 py-3">Check Out</th>
                <th className="text-left px-4 py-3">Hours</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3">Verification</th>
                <th className="text-left px-4 py-3">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {history.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-slate-400">No attendance history records found.</td>
                </tr>
              ) : (
                history.map(rec => (
                  <tr key={rec.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-3 font-semibold text-slate-900">{rec.date}</td>
                    <td className="px-4 py-3 text-slate-600 font-mono">{rec.checkInTime || '—'}</td>
                    <td className="px-4 py-3 text-slate-600 font-mono">{rec.checkOutTime || '—'}</td>
                    <td className="px-4 py-3 text-slate-700 font-medium">{rec.workingHours ? `${rec.workingHours} hrs` : '—'}</td>
                    <td className="px-4 py-3"><StatusBadge status={rec.status} /></td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        rec.verificationMethod === 'wfh_exception' ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                        rec.verificationMethod === 'remote_allowed' ? 'bg-purple-100 text-purple-800 border border-purple-300' :
                        'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      }`}>
                        {rec.verificationMethod === 'wfh_exception' ? 'WFH Exception' :
                         rec.verificationMethod === 'remote_allowed' ? 'Remote' : 'Office Wi-Fi'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-[11px] truncate max-w-xs">{rec.notes || '—'}</td>
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
