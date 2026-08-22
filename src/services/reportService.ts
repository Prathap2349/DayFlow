// src/services/reportService.ts
import { supabase } from '../db/supabaseClient';

export const reportService = {
  async getAnalyticsData() {
    // Total & Status Counts
    const { data: employees, error: empErr } = await supabase
      .from('employees')
      .select('id, department_id, employment_status, net_salary');

    if (empErr || !employees) {
      return this.fallbackData();
    }

    const { data: attendance } = await supabase
      .from('attendance')
      .select('status')
      .eq('attendance_date', new Date().toISOString().split('T')[0]);

    const { data: leaveRequests } = await supabase
      .from('leave_requests')
      .select('status, leave_type');

    // Aggregate Departments count
    const deptMap: Record<string, number> = {};
    employees.forEach((e: any) => {
      const deptName = e.department_id || 'Operations';
      deptMap[deptName] = (deptMap[deptName] || 0) + 1;
    });
    const departmentData = Object.entries(deptMap).map(([name, value]) => ({ name, value }));

    const totalEmployees = employees.length;
    const activeEmployees = employees.filter((e: any) => e.employment_status === 'Active').length;
    const onLeaveEmployees = employees.filter((e: any) => e.employment_status === 'On Leave').length;

    const presentCount = attendance?.filter((a: any) => a.status === 'present').length || 0;
    const absentCount = attendance?.filter((a: any) => a.status === 'absent').length || 0;
    const halfDayCount = attendance?.filter((a: any) => a.status === 'half_day').length || 0;
    const leaveCount = attendance?.filter((a: any) => a.status === 'leave').length || 0;

    const leaveStatusMap = {
      Pending: leaveRequests?.filter((l: any) => l.status === 'pending').length || 0,
      Approved: leaveRequests?.filter((l: any) => l.status === 'approved').length || 0,
      Rejected: leaveRequests?.filter((l: any) => l.status === 'rejected').length || 0,
    };

    const totalPayroll = employees.reduce((sum: number, e: any) => sum + Number(e.net_salary || 0), 0);
    const avgSalary = totalEmployees > 0 ? Math.round(totalPayroll / totalEmployees) : 0;

    return {
      kpis: {
        totalEmployees,
        activeEmployees,
        onLeaveEmployees,
        avgAttendanceRate: totalEmployees > 0 ? Math.round(((totalEmployees - absentCount) / totalEmployees) * 100) : 100,
        totalPayroll,
        avgSalary,
      },
      departmentData: departmentData.length > 0 ? departmentData : [{ name: 'Operations', value: totalEmployees }],
      attendanceData: [
        { name: 'Present', value: presentCount, color: '#10b981' },
        { name: 'Absent', value: absentCount, color: '#f43f5e' },
        { name: 'Half Day', value: halfDayCount, color: '#3b82f6' },
        { name: 'On Leave', value: leaveCount, color: '#f59e0b' },
      ],
      leaveData: [
        { name: 'Approved', value: leaveStatusMap.Approved },
        { name: 'Pending', value: leaveStatusMap.Pending },
        { name: 'Rejected', value: leaveStatusMap.Rejected },
      ],
    };
  },

  fallbackData() {
    return {
      kpis: {
        totalEmployees: 0,
        activeEmployees: 0,
        onLeaveEmployees: 0,
        avgAttendanceRate: 100,
        totalPayroll: 0,
        avgSalary: 0,
      },
      departmentData: [],
      attendanceData: [
        { name: 'Present', value: 0, color: '#10b981' },
        { name: 'Absent', value: 0, color: '#f43f5e' },
        { name: 'Half Day', value: 0, color: '#3b82f6' },
        { name: 'On Leave', value: 0, color: '#f59e0b' },
      ],
      leaveData: [
        { name: 'Approved', value: 0 },
        { name: 'Pending', value: 0 },
        { name: 'Rejected', value: 0 },
      ],
    };
  },
};
