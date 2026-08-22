// src/pages/employee/LeavePage.tsx
import { useState, useEffect } from 'react';
import { Palmtree, Plus, AlertCircle, Clock, X } from 'lucide-react';
import { Card, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge, StatusBadge } from '../../components/ui/Badge';
import { StatCard } from '../../components/shared/StatCard';
import { useAuth } from '../../auth/useAuth';
import { leaveService } from '../../services/leaveService';
import type { LeaveRequest, LeaveType } from '../../types/leave';
import toast from 'react-hot-toast';

export function EmployeeLeavePage() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form State
  const [leaveType, setLeaveType] = useState<LeaveType>('Paid');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [reason, setReason] = useState('');

  const empId = user?.employeeId || 'EMP001';

  const loadLeaves = async () => {
    const list = await leaveService.getLeaveRequests(empId);
    setRequests(list);
  };

  useEffect(() => {
    loadLeaves();
  }, [user]);

  // Calculate Days Automatically
  const calculatedDays = (() => {
    const s = new Date(startDate);
    const e = new Date(endDate);
    if (isNaN(s.getTime()) || isNaN(e.getTime()) || e < s) return 0;
    const diff = Math.abs(e.getTime() - s.getTime());
    return Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
  })();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (calculatedDays <= 0) {
      toast.error('End date cannot be earlier than start date.');
      return;
    }
    if (!reason.trim()) {
      toast.error('Please enter a reason for your leave request.');
      return;
    }

    setLoading(true);
    try {
      await leaveService.applyLeave({
        employeeId: empId,
        employeeName: user.name,
        department: user.department || 'Engineering',
        leaveType,
        startDate,
        endDate,
        reason: reason.trim(),
      });
      toast.success('Leave request submitted successfully.');
      setModalOpen(false);
      setReason('');
      loadLeaves();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed submitting leave request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Leave & Time-off Management</h2>
          <p className="text-xs text-slate-500 mt-0.5">Apply for leaves and track request statuses</p>
        </div>
        <Button onClick={() => setModalOpen(true)} leftIcon={<Plus className="w-4 h-4" />}>
          Apply for Leave
        </Button>
      </div>

      {/* Leave Balances Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Paid / Annual Leave"
          value="12 days"
          subtext="Available quota: 18 days"
          icon={<Palmtree className="w-5 h-5" />}
          iconBg="bg-indigo-50 text-indigo-600"
        />
        <StatCard
          label="Sick Leave"
          value="6 days"
          subtext="Available quota: 10 days"
          icon={<AlertCircle className="w-5 h-5" />}
          iconBg="bg-amber-50 text-amber-600"
        />
        <StatCard
          label="Casual Leave"
          value="4 days"
          subtext="Available quota: 6 days"
          icon={<Clock className="w-5 h-5" />}
          iconBg="bg-blue-50 text-blue-600"
        />
      </div>

      {/* Leave History Table */}
      <Card padding="none">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <CardHeader title="My Leave History" subtitle="Submissions and approvals" />
          <Badge variant="purple">{requests.length} Requests</Badge>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-slate-500 uppercase tracking-wider text-[11px] font-semibold">
                <th className="text-left px-5 py-3">Leave Type</th>
                <th className="text-left px-4 py-3">Dates</th>
                <th className="text-left px-4 py-3">Duration</th>
                <th className="text-left px-4 py-3">Reason</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3">Applied On</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {requests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">No leave requests found.</td>
                </tr>
              ) : (
                requests.map(req => (
                  <tr key={req.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-3.5 font-semibold text-slate-900">{req.leaveType} Leave</td>
                    <td className="px-4 py-3.5 text-slate-700">
                      {req.startDate} — {req.endDate}
                    </td>
                    <td className="px-4 py-3.5 font-bold text-slate-800">{req.days} day(s)</td>
                    <td className="px-4 py-3.5 text-slate-600 max-w-xs truncate" title={req.reason}>
                      {req.reason}
                    </td>
                    <td className="px-4 py-3.5">
                      <div>
                        <StatusBadge status={req.status} />
                        {req.rejectionComment && (
                          <p className="text-[10px] text-red-600 mt-1 italic">Reason: "{req.rejectionComment}"</p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-slate-400">{req.appliedOn}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Apply Leave Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-lg p-6 animate-fade-in">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Apply for Leave</h3>
              <button onClick={() => setModalOpen(false)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Leave Type *</label>
                <select
                  value={leaveType}
                  onChange={e => setLeaveType(e.target.value as LeaveType)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
                >
                  <option value="Paid">Paid / Annual Leave</option>
                  <option value="Sick">Sick Leave</option>
                  <option value="Casual">Casual Leave</option>
                  <option value="Unpaid">Unpaid Leave</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Start Date *"
                  type="date"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  required
                />
                <Input
                  label="End Date *"
                  type="date"
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                  required
                />
              </div>

              {calculatedDays > 0 && (
                <div className="p-2.5 rounded-lg bg-indigo-50 text-indigo-700 font-semibold text-center">
                  Total Duration: {calculatedDays} Day(s)
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Reason / Remarks *</label>
                <textarea
                  rows={3}
                  placeholder="Explain the reason for your leave request..."
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <Button variant="ghost" type="button" onClick={() => setModalOpen(false)}>Cancel</Button>
                <Button type="submit" isLoading={loading}>Submit Leave Request</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
