// src/services/leaveService.ts
import { supabase } from '../db/supabaseClient';
import type { LeaveRequest, LeaveType } from '../types/leave';
import { notificationService } from './notificationService';

export const leaveService = {
  async getLeaveRequests(employeeId?: string): Promise<LeaveRequest[]> {
    let query = supabase
      .from('leave_requests')
      .select('*, employees(*)')
      .order('submitted_at', { ascending: false });

    if (employeeId) {
      // Resolve employee database UUID first
      const { data: emp } = await supabase
        .from('employees')
        .select('id')
        .or(`id.eq.${employeeId},employee_code.eq.${employeeId}`)
        .maybeSingle();

      if (emp) {
        query = query.eq('employee_id', emp.id);
      } else {
        return [];
      }
    }

    const { data, error } = await query;
    if (error) {
      console.error('Error fetching leave requests:', error.message);
      throw new Error(error.message);
    }

    return (data || []).map((r: any) => ({
      id: r.id,
      employeeId: r.employees?.employee_code || '',
      employeeName: `${r.employees?.first_name || ''} ${r.employees?.last_name || ''}`.trim(),
      department: r.employees?.department_id || 'Operations',
      leaveType: this.mapDbLeaveType(r.leave_type),
      startDate: r.start_date,
      endDate: r.end_date,
      days: Number(r.number_of_days),
      reason: r.reason,
      status: this.mapDbStatus(r.status),
      appliedOn: r.submitted_at ? new Date(r.submitted_at).toISOString().split('T')[0] : '',
      reviewedBy: r.reviewed_by || undefined,
      reviewedOn: r.reviewed_at ? new Date(r.reviewed_at).toISOString().split('T')[0] : undefined,
      rejectionComment: r.review_comment || undefined,
    }));
  },

  async applyLeave(data: {
    employeeId: string;
    employeeName: string;
    department: string;
    leaveType: LeaveType;
    startDate: string;
    endDate: string;
    reason: string;
  }): Promise<LeaveRequest> {
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime()) || end < start) {
      throw new Error('Leave end date cannot be earlier than start date.');
    }
    if (!data.reason.trim()) {
      throw new Error('Please provide a reason.');
    }

    const diffTime = Math.abs(end.getTime() - start.getTime());
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    // Resolve employee database UUID
    const { data: emp, error: empErr } = await supabase
      .from('employees')
      .select('id')
      .or(`id.eq.${data.employeeId},employee_code.eq.${data.employeeId}`)
      .maybeSingle();

    if (empErr || !emp) throw new Error('Employee record not found.');

    const { data: created, error } = await supabase
      .from('leave_requests')
      .insert({
        employee_id: emp.id,
        leave_type: data.leaveType.toLowerCase(),
        start_date: data.startDate,
        end_date: data.endDate,
        number_of_days: days,
        reason: data.reason.trim(),
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      console.error('Error applying leave:', error.message);
      throw new Error(error.message);
    }

    // Trigger notification for HR
    await notificationService.addNotification({
      recipientId: 'all',
      type: 'leave_pending',
      title: 'New Leave Request',
      message: `${data.employeeName} applied for ${days} day(s) of ${data.leaveType} Leave.`,
      link: '/admin/leave',
    });

    return {
      id: created.id,
      employeeId: data.employeeId,
      employeeName: data.employeeName,
      department: data.department,
      leaveType: data.leaveType,
      startDate: created.start_date,
      endDate: created.end_date,
      days: Number(created.number_of_days),
      reason: created.reason,
      status: 'Pending',
      appliedOn: new Date().toISOString().split('T')[0],
    };
  },

  async approveLeave(requestId: string, _reviewerName: string): Promise<LeaveRequest> {
    const { data: authUser } = await supabase.auth.getUser();
    const reviewerId = authUser?.user?.id;

    const { data: currentReq, error: fetchErr } = await supabase
      .from('leave_requests')
      .select('*, employees(*)')
      .eq('id', requestId)
      .single();

    if (fetchErr || !currentReq) throw new Error('Leave request not found.');

    if (currentReq.status !== 'pending') {
      throw new Error(`Leave request has already been ${currentReq.status}.`);
    }

    const { data: updated, error } = await supabase
      .from('leave_requests')
      .update({
        status: 'approved',
        reviewed_by: reviewerId,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', requestId)
      .select()
      .single();

    if (error) {
      console.error('Error approving leave:', error.message);
      throw new Error(error.message);
    }

    // Deduct leave balance in Employees table
    const currentBalance = currentReq.employees?.leave_balance || 18;
    const newBalance = Math.max(0, currentBalance - Number(currentReq.number_of_days));

    await supabase
      .from('employees')
      .update({ leave_balance: newBalance })
      .eq('id', currentReq.employee_id);

    // Notify employee (using user_id of the employee's auth record if linked)
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('employee_id', currentReq.employee_id)
      .maybeSingle();

    if (profile) {
      await notificationService.addNotification({
        recipientId: profile.id,
        type: 'leave_approved',
        title: 'Leave Request Approved ✅',
        message: `Your ${this.mapDbLeaveType(currentReq.leave_type)} Leave request for ${currentReq.start_date} to ${currentReq.end_date} was approved.`,
        link: '/employee/leave',
      });
    }

    return {
      id: updated.id,
      employeeId: currentReq.employees?.employee_code || '',
      employeeName: `${currentReq.employees?.first_name || ''} ${currentReq.employees?.last_name || ''}`.trim(),
      department: currentReq.employees?.department_id || '',
      leaveType: this.mapDbLeaveType(updated.leave_type),
      startDate: updated.start_date,
      endDate: updated.end_date,
      days: Number(updated.number_of_days),
      reason: updated.reason,
      status: 'Approved',
      appliedOn: updated.submitted_at,
    };
  },

  async rejectLeave(requestId: string, _reviewerName: string, comment: string): Promise<LeaveRequest> {
    if (!comment.trim()) {
      throw new Error('A rejection comment is required.');
    }

    const { data: authUser } = await supabase.auth.getUser();
    const reviewerId = authUser?.user?.id;

    const { data: currentReq, error: fetchErr } = await supabase
      .from('leave_requests')
      .select('*, employees(*)')
      .eq('id', requestId)
      .single();

    if (fetchErr || !currentReq) throw new Error('Leave request not found.');

    if (currentReq.status !== 'pending') {
      throw new Error(`Leave request has already been ${currentReq.status}.`);
    }

    const { data: updated, error } = await supabase
      .from('leave_requests')
      .update({
        status: 'rejected',
        reviewed_by: reviewerId,
        review_comment: comment.trim(),
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', requestId)
      .select()
      .single();

    if (error) {
      console.error('Error rejecting leave:', error.message);
      throw new Error(error.message);
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('employee_id', currentReq.employee_id)
      .maybeSingle();

    if (profile) {
      await notificationService.addNotification({
        recipientId: profile.id,
        type: 'leave_rejected',
        title: 'Leave Request Rejected ❌',
        message: `Your ${this.mapDbLeaveType(currentReq.leave_type)} Leave request was rejected. Comment: "${comment.trim()}"`,
        link: '/employee/leave',
      });
    }

    return {
      id: updated.id,
      employeeId: currentReq.employees?.employee_code || '',
      employeeName: `${currentReq.employees?.first_name || ''} ${currentReq.employees?.last_name || ''}`.trim(),
      department: currentReq.employees?.department_id || '',
      leaveType: this.mapDbLeaveType(updated.leave_type),
      startDate: updated.start_date,
      endDate: updated.end_date,
      days: Number(updated.number_of_days),
      reason: updated.reason,
      status: 'Rejected',
      appliedOn: updated.submitted_at,
    };
  },

  mapDbLeaveType(type: string): LeaveType {
    switch (type) {
      case 'paid': return 'Paid';
      case 'sick': return 'Sick';
      case 'unpaid': return 'Unpaid';
      default: return 'Paid';
    }
  },

  mapDbStatus(status: string): any {
    switch (status) {
      case 'pending': return 'Pending';
      case 'approved': return 'Approved';
      case 'rejected': return 'Rejected';
      default: return 'Pending';
    }
  },
};
