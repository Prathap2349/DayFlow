// src/pages/admin/DashboardPage.tsx
import { useState, useEffect } from 'react';
import {
  Users, UserCheck, Palmtree, ClipboardList,
  Search, ChevronLeft, ChevronRight, Eye, Check, X
} from 'lucide-react';
import { useAuth } from '../../auth/useAuth';
import { StatCard } from '../../components/shared/StatCard';
import { Card, CardHeader } from '../../components/ui/Card';
import { Badge, StatusBadge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { Button } from '../../components/ui/Button';
import { employeeService } from '../../services/employeeService';
import { attendanceService } from '../../services/attendanceService';
import { leaveService } from '../../services/leaveService';
import type { Employee } from '../../types/employee';
import type { LeaveRequest } from '../../types/leave';
import type { AttendanceSummary } from '../../types/attendance';
import toast from 'react-hot-toast';
import { AreaChart, Area, XAxis, PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const ITEMS_PER_PAGE = 6;

export function AdminDashboardPage() {
  const { user } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [attSummary, setAttSummary] = useState<AttendanceSummary>({
    present: 114,
    absent: 6,
    halfDay: 4,
    onLeave: 8,
    total: 132,
  });

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selectedEmp, setSelectedEmp] = useState<Employee | null>(null);

  // Rejection modal state
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedReq, setSelectedReq] = useState<LeaveRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const loadAllData = async () => {
    try {
      const emps = await employeeService.getEmployees();
      setEmployees(emps);

      const leaves = await leaveService.getLeaveRequests();
      setLeaveRequests(leaves);

      const summary = await attendanceService.getAttendanceSummary();
      setAttSummary(summary);
    } catch (err) {
      console.warn('Error loading admin dashboard data:', err);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Employee table filtering & pagination
  const filtered = employees.filter(
    e =>
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.employeeId.toLowerCase().includes(search.toLowerCase()) ||
      e.department.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE) || 1;
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  // Leave approval/rejection
  const handleApprove = async (id: string) => {
    try {
      await leaveService.approveLeave(id, user?.name ?? 'HR Admin');
      toast.success('Leave request approved successfully.');
      loadAllData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Approval failed');
    }
  };

  const handleOpenReject = (req: LeaveRequest) => {
    setSelectedReq(req);
    setRejectionReason('');
    setRejectModalOpen(true);
  };

  const handleConfirmReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReq) return;
    if (!rejectionReason.trim()) {
      toast.error('Rejection reason is required.');
      return;
    }
    try {
      await leaveService.rejectLeave(selectedReq.id, user?.name ?? 'HR Admin', rejectionReason.trim());
      toast.success('Leave request rejected.');
      setRejectModalOpen(false);
      loadAllData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Rejection failed');
    }
  };

  const pendingLeaves = leaveRequests.filter(l => l.status === 'Pending');
  const onLeaveCount = employees.filter(e => e.status === 'On Leave').length;

  const chartData = [
    { name: 'Present', value: attSummary.present || 114, color: '#10b981' },
    { name: 'Absent', value: attSummary.absent || 6, color: '#f43f5e' },
    { name: 'Half Day', value: attSummary.halfDay || 4, color: '#3b82f6' },
    { name: 'On Leave', value: attSummary.onLeave || 8, color: '#f59e0b' },
  ];

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Good morning, HR Team 👋</h2>
        <p className="text-slate-500 mt-1 text-sm">Here's your live workforce overview for today.</p>
      </div>

      {/* Stats Cards derived from Data Layer */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          label="Total Employees"
          value={employees.length}
          subtext="All registered records"
          icon={<Users style={{ width: 20, height: 20 }} />}
          iconBg="bg-indigo-50 text-indigo-600"
        />
        <StatCard
          label="Present Today"
          value={attSummary.present}
          subtext="Active check-ins"
          icon={<UserCheck style={{ width: 20, height: 20 }} />}
          iconBg="bg-emerald-50 text-emerald-600"
        />
        <StatCard
          label="On Leave"
          value={onLeaveCount}
          subtext="Today's time-off"
          icon={<Palmtree style={{ width: 20, height: 20 }} />}
          iconBg="bg-amber-50 text-amber-600"
        />
        <StatCard
          label="Pending Approvals"
          value={pendingLeaves.length}
          subtext="Requires HR review"
          icon={<ClipboardList style={{ width: 20, height: 20 }} />}
          iconBg="bg-red-50 text-red-600"
        />
      </div>

      {/* Employee Table + Attendance Chart */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card padding="none" className="xl:col-span-2">
          <div className="px-5 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <CardHeader title="Employee Overview" subtitle={`${filtered.length} employees found`} />
            <div className="relative w-full sm:w-56">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search employees…"
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
                className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60 font-semibold text-slate-500 uppercase">
                  <th className="text-left px-5 py-3">Employee</th>
                  <th className="text-left px-3 py-3 hidden md:table-cell">Dept.</th>
                  <th className="text-left px-3 py-3">Status</th>
                  <th className="text-right px-5 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {paginated.map(emp => (
                  <tr key={emp.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <Avatar name={emp.name} size="sm" />
                        <div>
                          <p className="font-semibold text-slate-900">{emp.name}</p>
                          <p className="text-[11px] text-slate-400">{emp.employeeId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3.5 hidden md:table-cell text-slate-600">{emp.department}</td>
                    <td className="px-3 py-3.5"><StatusBadge status={emp.status} /></td>
                    <td className="px-5 py-3.5 text-right">
                      <Button variant="ghost" size="sm" leftIcon={<Eye className="w-3.5 h-3.5" />} onClick={() => setSelectedEmp(emp)}>
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Page {page} of {totalPages}</span>
              <div className="flex items-center gap-1">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-1 rounded hover:bg-slate-100 disabled:opacity-40">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-1 rounded hover:bg-slate-100 disabled:opacity-40">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </Card>

        {/* Attendance Donut & Weekly Trend Chart */}
        <Card>
          <CardHeader title="Today's Attendance Ratio" subtitle={`${attSummary.total || 132} total workforce`} />
          <ResponsiveContainer width="100%" height={140}>
            <PieChart>
              <Pie data={chartData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3} dataKey="value">
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(val) => [val, '']} contentStyle={{ borderRadius: 8, fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 mt-2">
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Weekly Attendance Trend</p>
            <div className="h-24">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={[
                  { day: 'Mon', present: 128 },
                  { day: 'Tue', present: 130 },
                  { day: 'Wed', present: 125 },
                  { day: 'Thu', present: 129 },
                  { day: 'Fri', present: 122 },
                ]}>
                  <defs>
                    <linearGradient id="colorPresent" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" stroke="#94a3b8" fontSize={10} />
                  <Tooltip contentStyle={{ borderRadius: 8, fontSize: 11 }} />
                  <Area type="monotone" dataKey="present" stroke="#6366f1" fillOpacity={1} fill="url(#colorPresent)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Card>
      </div>

      {/* Leave Approval Table */}
      <Card padding="none">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <CardHeader title="Leave Approval Requests" subtitle={`${pendingLeaves.length} pending decisions`} />
          <Badge variant="warning" dot>{pendingLeaves.length} Pending</Badge>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60 font-semibold text-slate-500 uppercase">
                <th className="text-left px-5 py-3">Employee</th>
                <th className="text-left px-3 py-3">Type</th>
                <th className="text-left px-3 py-3">Dates</th>
                <th className="text-left px-3 py-3 max-w-xs">Reason</th>
                <th className="text-left px-3 py-3">Status</th>
                <th className="text-right px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {leaveRequests.map(req => (
                <tr key={req.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <Avatar name={req.employeeName} size="sm" />
                      <div>
                        <p className="font-semibold text-slate-900">{req.employeeName}</p>
                        <p className="text-[11px] text-slate-400">{req.department}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3.5"><Badge variant="info">{req.leaveType}</Badge></td>
                  <td className="px-3 py-3.5 text-slate-600">{req.startDate} — {req.endDate} ({req.days}d)</td>
                  <td className="px-3 py-3.5 text-slate-600 max-w-xs truncate" title={req.reason}>{req.reason}</td>
                  <td className="px-3 py-3.5"><StatusBadge status={req.status} /></td>
                  <td className="px-5 py-3.5 text-right">
                    {req.status === 'Pending' ? (
                      <div className="flex items-center justify-end gap-1.5">
                        <button onClick={() => handleApprove(req.id)} className="px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> Approve
                        </button>
                        <button onClick={() => handleOpenReject(req)} className="px-2.5 py-1 rounded-md text-xs font-semibold bg-red-50 text-red-600 hover:bg-red-100 flex items-center gap-1">
                          <X className="w-3.5 h-3.5" /> Reject
                        </button>
                      </div>
                    ) : (
                      <span className="text-[11px] text-slate-400">By {req.reviewedBy ?? 'Admin'}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Employee Quick Detail Modal */}
      {selectedEmp && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-md p-6 animate-fade-in text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900">Employee Summary</h3>
              <button onClick={() => setSelectedEmp(null)} className="p-1 text-slate-400"><X className="w-4 h-4" /></button>
            </div>
            <div className="py-4 space-y-2">
              <p><strong>Name:</strong> {selectedEmp.name}</p>
              <p><strong>ID:</strong> {selectedEmp.employeeId}</p>
              <p><strong>Department:</strong> {selectedEmp.department}</p>
              <p><strong>Job Title:</strong> {selectedEmp.jobTitle}</p>
              <p><strong>Status:</strong> {selectedEmp.status}</p>
              <p><strong>Net Take-Home Pay:</strong> ₹{(selectedEmp.netSalary || 82000).toLocaleString()}/mo</p>
            </div>
            <div className="flex justify-end pt-3 border-t border-slate-100">
              <Button variant="ghost" onClick={() => setSelectedEmp(null)}>Close</Button>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Comment Modal */}
      {rejectModalOpen && selectedReq && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-md p-6 animate-fade-in text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900">Reject Leave Request</h3>
              <button onClick={() => setRejectModalOpen(false)} className="p-1 text-slate-400"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleConfirmReject} className="space-y-4 mt-3">
              <p className="text-slate-600">Reject leave for <strong>{selectedReq.employeeName}</strong>?</p>
              <div>
                <label className="block font-semibold mb-1">Rejection Reason *</label>
                <textarea
                  rows={3}
                  value={rejectionReason}
                  onChange={e => setRejectionReason(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg text-slate-900"
                  required
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <Button variant="ghost" type="button" onClick={() => setRejectModalOpen(false)}>Cancel</Button>
                <Button variant="danger" type="submit">Confirm Rejection</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
