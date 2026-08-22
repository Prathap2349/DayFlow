// src/pages/employee/DashboardPage.tsx
import { useState, useEffect } from 'react';
import { CalendarCheck, Palmtree, ClipboardList, CheckCircle2, User, Bell, ChevronRight, Clock } from 'lucide-react';
import { useAuth } from '../../auth/useAuth';
import { StatCard } from '../../components/shared/StatCard';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { attendanceService } from '../../services/attendanceService';
import { leaveService } from '../../services/leaveService';
import type { AttendanceRecord } from '../../types/attendance';
import type { LeaveRequest } from '../../types/leave';
import { clsx } from 'clsx';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { badgeService } from '../../services/badgeService';

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

const quickActions = [
  { label: 'View Attendance', icon: CalendarCheck, to: '/employee/attendance', color: 'bg-blue-50/80  text-blue-700  border-blue-100  hover:bg-blue-100 ' },
  { label: 'Apply for Leave', icon: Palmtree, to: '/employee/leave', color: 'bg-amber-50/80  text-amber-700  border-amber-100  hover:bg-amber-100 ' },
  { label: 'View Profile', icon: User, to: '/employee/profile', color: 'bg-violet-50/80  text-violet-700  border-violet-100  hover:bg-violet-100 ' },
  { label: 'Notifications', icon: Bell, to: '/employee/notifications', color: 'bg-emerald-50/80  text-emerald-700  border-emerald-100  hover:bg-emerald-100 ' },
];

export function EmployeeDashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const firstName = user?.name?.split(' ')[0] ?? 'there';
  const empId = user?.employeeId || 'EMP001';

  const [todayRecord, setTodayRecord] = useState<AttendanceRecord | null>(null);
  const [myLeaveRequests, setMyLeaveRequests] = useState<LeaveRequest[]>([]);

  const loadData = async () => {
    try {
      const today = await attendanceService.getTodayRecord(empId);
      setTodayRecord(today);

      const leaves = await leaveService.getLeaveRequests(empId);
      setMyLeaveRequests(leaves);
    } catch (err) {
      console.warn('Error loading employee dashboard data:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleQuickCheckIn = async () => {
    if (!user) return;
    try {
      if (!todayRecord?.checkInTime) {
        await attendanceService.checkIn({
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
        toast.success('Successfully checked in!');
      } else {
        await attendanceService.checkOut(empId);
        toast.success('Successfully checked out!');
      }
      loadData();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Action failed');
    }
  };

  const pendingCount = myLeaveRequests.filter(l => l.status === 'Pending').length;
  const isCheckedIn = !!todayRecord?.checkInTime;
  const isCheckedOut = !!todayRecord?.checkOutTime;

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 ">
            {getGreeting()}, {firstName} 👋
          </h2>
          <p className="text-slate-600  mt-1 text-sm">
            Here's what's happening with your workday.
          </p>
        </div>

        {/* Quick Punch Button */}
        <Button
          size="md"
          variant={isCheckedIn && !isCheckedOut ? 'secondary' : 'primary'}
          disabled={isCheckedOut}
          onClick={handleQuickCheckIn}
          leftIcon={<Clock className="w-4 h-4" />}
        >
          {isCheckedOut
            ? `Shift Done (${todayRecord?.checkOutTime})`
            : isCheckedIn
            ? `Check Out (In at ${todayRecord?.checkInTime})`
            : 'Check In Now'}
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          label="Attendance Rate"
          value="94%"
          subtext="This month"
          icon={<CalendarCheck style={{ width: 20, height: 20 }} />}
          iconBg="bg-blue-50 text-blue-600"
        />
        <StatCard
          label="Leave Balance"
          value="12 days"
          subtext="Annual + Sick remaining"
          icon={<Palmtree style={{ width: 20, height: 20 }} />}
          iconBg="bg-amber-50 text-amber-600"
        />
        <StatCard
          label="Pending Requests"
          value={pendingCount}
          subtext="Awaiting HR approval"
          icon={<ClipboardList style={{ width: 20, height: 20 }} />}
          iconBg="bg-violet-50 text-violet-600"
        />
        <StatCard
          label="Today's Status"
          value={todayRecord?.status ?? 'Not Checked In'}
          subtext={todayRecord?.checkInTime ? `Checked in at ${todayRecord.checkInTime}` : 'Pending punch'}
          icon={<CheckCircle2 style={{ width: 20, height: 20 }} />}
          iconBg="bg-emerald-50 text-emerald-600"
        />
      </div>

      {/* Gamification Badges Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-50 via-violet-50 to-amber-50   border border-indigo-100/80 ">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold text-indigo-950  uppercase tracking-wider flex items-center gap-1.5">
            🏆 Workplace Streaks & Achievements
          </h3>
          <span className="text-[11px] text-indigo-600  font-semibold cursor-pointer hover:underline" onClick={() => navigate('/employee/profile')}>
            View All Badges →
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {badgeService.getEmployeeBadges(empId).map(b => (
            <div key={b.id} className={`p-3 rounded-xl border ${b.colorBg} flex items-center gap-3 transition-transform hover:-translate-y-0.5`}>
              <span className="text-2xl">{b.icon}</span>
              <div>
                <p className={`text-xs font-bold ${b.colorText}`}>{b.title}</p>
                <p className="text-[10px] text-slate-600  leading-tight mt-0.5">{b.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions & Working Hours Chart */}
        <div className="lg:col-span-1 space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-slate-700  mb-3">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              {quickActions.map(({ label, icon: Icon, to, color }) => (
                <button
                  key={to}
                  onClick={() => navigate(to)}
                  className={clsx(
                    'flex flex-col items-center gap-3 p-4 rounded-xl border border-transparent',
                    'transition-all duration-150 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500',
                    color
                  )}
                >
                  <div className="w-10 h-10 rounded-xl bg-white/60 flex items-center justify-center shadow-sm">
                    <Icon style={{ width: 20, height: 20 }} />
                  </div>
                  <span className="text-xs font-medium text-center leading-tight">{label}</span>
                </button>
              ))}
            </div>
          </div>

          <Card padding="md">
            <h4 className="text-xs font-bold text-slate-800  mb-3">Weekly Hours Logged</h4>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[
                  { day: 'M', hours: 8.5 },
                  { day: 'T', hours: 9.0 },
                  { day: 'W', hours: 8.0 },
                  { day: 'T', hours: 8.8 },
                  { day: 'F', hours: 7.5 },
                ]}>
                  <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} domain={[0, 10]} />
                  <Tooltip contentStyle={{ borderRadius: 8, fontSize: 11 }} />
                  <Bar dataKey="hours" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* My Leave Requests */}
        <Card padding="none" className="lg:col-span-2">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-slate-900">My Leave Submissions</h3>
              <p className="text-xs text-slate-600 mt-0.5">Live status from leave service</p>
            </div>
            <button
              onClick={() => navigate('/employee/leave')}
              className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1"
            >
              View all <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <ul className="divide-y divide-slate-50">
            {myLeaveRequests.length === 0 ? (
              <li className="px-5 py-8 text-center text-xs text-slate-600">No leave requests found.</li>
            ) : (
              myLeaveRequests.slice(0, 4).map(req => (
                <li key={req.id} className="flex items-center justify-between px-5 py-3.5 text-xs">
                  <div>
                    <p className="font-semibold text-slate-800">{req.leaveType} Leave ({req.days}d)</p>
                    <p className="text-[11px] text-slate-600 mt-0.5">{req.startDate} — {req.endDate}</p>
                  </div>
                  <Badge variant={req.status === 'Approved' ? 'success' : req.status === 'Rejected' ? 'danger' : 'warning'} dot>
                    {req.status}
                  </Badge>
                </li>
              ))
            )}
          </ul>
        </Card>
      </div>
    </div>
  );
}
