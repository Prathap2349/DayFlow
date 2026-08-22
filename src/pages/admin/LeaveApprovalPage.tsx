// src/pages/admin/LeaveApprovalPage.tsx
import { useState, useEffect } from 'react';
import { Check, X, Search } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge, StatusBadge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { useAuth } from '../../auth/useAuth';
import { leaveService } from '../../services/leaveService';
import type { LeaveRequest } from '../../types/leave';
import toast from 'react-hot-toast';

export function AdminLeaveApprovalPage() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [statusFilter, setStatusFilter] = useState('All');
  const [search, setSearch] = useState('');

  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedReq, setSelectedReq] = useState<LeaveRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const loadRequests = async () => {
    const list = await leaveService.getLeaveRequests();
    setRequests(list);
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleApprove = async (req: LeaveRequest) => {
    try {
      await leaveService.approveLeave(req.id, user?.name ?? 'HR Admin');
      toast.success(`Approved leave request for ${req.employeeName}`);
      loadRequests();
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
      toast.success(`Rejected leave request for ${selectedReq.employeeName}`);
      setRejectModalOpen(false);
      loadRequests();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Rejection failed');
    }
  };

  const filtered = requests.filter(r => {
    const matchSearch =
      r.employeeName.toLowerCase().includes(search.toLowerCase()) ||
      r.department.toLowerCase().includes(search.toLowerCase()) ||
      r.leaveType.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'All' || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Leave Approvals</h2>
          <p className="text-xs text-slate-500 mt-0.5">Review and manage workforce leave applications</p>
        </div>
      </div>

      <Card padding="none">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search employee, dept..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 bg-white"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Status:</span>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
            >
              <option value="All">All Requests</option>
              <option value="Pending">Pending Only</option>
              <option value="Approved">Approved Only</option>
              <option value="Rejected">Rejected Only</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-slate-500 uppercase tracking-wider text-[11px] font-semibold">
                <th className="text-left px-5 py-3">Employee</th>
                <th className="text-left px-4 py-3">Leave Type</th>
                <th className="text-left px-4 py-3">Date Range</th>
                <th className="text-left px-4 py-3">Duration</th>
                <th className="text-left px-4 py-3 max-w-xs">Reason</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-right px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">No leave approval requests found.</td>
                </tr>
              ) : (
                filtered.map(req => (
                  <tr key={req.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <Avatar name={req.employeeName} size="sm" />
                        <div>
                          <p className="font-semibold text-slate-900">{req.employeeName}</p>
                          <p className="text-[11px] text-slate-400">{req.department}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5"><Badge variant="info">{req.leaveType}</Badge></td>
                    <td className="px-4 py-3.5 text-slate-700">{req.startDate} — {req.endDate}</td>
                    <td className="px-4 py-3.5 font-bold text-slate-800">{req.days} day(s)</td>
                    <td className="px-4 py-3.5 text-slate-600 max-w-xs truncate" title={req.reason}>
                      {req.reason}
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={req.status} />
                      {req.rejectionComment && (
                        <p className="text-[10px] text-red-500 italic mt-0.5 max-w-xs truncate" title={req.rejectionComment}>
                          "{req.rejectionComment}"
                        </p>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      {req.status === 'Pending' ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleApprove(req)}
                            className="px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 flex items-center gap-1"
                          >
                            <Check className="w-3.5 h-3.5" /> Approve
                          </button>
                          <button
                            onClick={() => handleOpenReject(req)}
                            className="px-2.5 py-1 rounded-md text-xs font-semibold bg-red-50 text-red-600 hover:bg-red-100 flex items-center gap-1"
                          >
                            <X className="w-3.5 h-3.5" /> Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400">
                          Reviewed by {req.reviewedBy ?? 'Admin'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {rejectModalOpen && selectedReq && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-md p-6 animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Reject Leave Request</h3>
              <button onClick={() => setRejectModalOpen(false)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmReject} className="space-y-4 mt-4 text-xs">
              <p className="text-slate-600">
                You are rejecting the <strong>{selectedReq.leaveType} Leave</strong> request for <strong>{selectedReq.employeeName}</strong>.
              </p>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Rejection Reason * (Mandatory)</label>
                <textarea
                  rows={3}
                  placeholder="Provide a clear reason for rejecting this leave request..."
                  value={rejectionReason}
                  onChange={e => setRejectionReason(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
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
