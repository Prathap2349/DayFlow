// src/services/emailService.ts
import { supabase } from '../db/supabaseClient';
import type { LeaveRequest } from '../types/leave';

export interface EmailPayload {
  to: string;
  subject: string;
  bodyHtml: string;
  type: 'leave_request' | 'leave_approval' | 'leave_rejection' | 'welcome' | 'system';
}

export const emailService = {
  /**
   * Dispatch an email notification and insert an in-app notification record
   */
  async sendEmail(payload: EmailPayload): Promise<{ success: boolean; message: string }> {
    console.log(`📧 [EMAIL DISPATCHER] To: ${payload.to} | Subject: ${payload.subject}`);
    console.log(`📄 [BODY]:\n${payload.bodyHtml.replace(/<[^>]+>/g, ' ')}`);

    try {
      // 1. Insert in-app notification to Supabase notifications table
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', payload.to)
        .maybeSingle();

      if (userProfile?.id) {
        await supabase.from('notifications').insert({
          user_id: userProfile.id,
          title: payload.subject,
          message: payload.bodyHtml.replace(/<[^>]+>/g, '').trim(),
          type: payload.type,
          is_read: false,
        });
      }

      // 2. Mock external email provider dispatch (Resend / SendGrid API)
      return { success: true, message: `Email dispatched to ${payload.to}` };
    } catch (err) {
      console.warn('Failed to record notification email:', err);
      return { success: false, message: 'Failed to record email' };
    }
  },

  /**
   * Send Leave Request Notification Email to HR
   */
  async notifyHrNewLeaveRequest(employeeName: string, leave: LeaveRequest): Promise<void> {
    await this.sendEmail({
      to: 'hr@dayflow.demo',
      subject: `📢 New Leave Request from ${employeeName}`,
      type: 'leave_request',
      bodyHtml: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2>New Leave Request Received</h2>
          <p><strong>Employee:</strong> ${employeeName}</p>
          <p><strong>Leave Type:</strong> ${leave.leaveType.toUpperCase()}</p>
          <p><strong>Dates:</strong> ${leave.startDate} to ${leave.endDate} (${leave.days} days)</p>
          <p><strong>Reason:</strong> ${leave.reason}</p>
          <p>Please log in to Dayflow HR portal to review and approve/reject this request.</p>
        </div>
      `,
    });
  },

  /**
   * Send Leave Request Review Status Email to Employee
   */
  async notifyEmployeeLeaveStatus(
    employeeEmail: string,
    employeeName: string,
    leave: LeaveRequest,
    status: 'Approved' | 'Rejected',
    reviewerComments?: string
  ): Promise<void> {
    const isApproved = status === 'Approved';
    await this.sendEmail({
      to: employeeEmail,
      subject: `${isApproved ? '✅' : '❌'} Your Leave Request has been ${status}`,
      type: isApproved ? 'leave_approval' : 'leave_rejection',
      bodyHtml: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2>Leave Request ${status}</h2>
          <p>Hi ${employeeName},</p>
          <p>Your <strong>${leave.leaveType.toUpperCase()}</strong> leave request for <strong>${leave.startDate} to ${leave.endDate}</strong> has been <strong>${status.toLowerCase()}</strong> by HR.</p>
          ${reviewerComments ? `<p><strong>HR Comments:</strong> ${reviewerComments}</p>` : ''}
          <p>Log in to Dayflow to view your updated leave balance.</p>
        </div>
      `,
    });
  },
};
