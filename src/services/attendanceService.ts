// src/services/attendanceService.ts
import { supabase } from '../db/supabaseClient';
import type { AttendanceRecord, AttendanceSummary } from '../types/attendance';
import type { Employee } from '../types/employee';
import { officeService } from './officeService';

export const attendanceService = {
  async getTodayRecord(employeeId: string): Promise<AttendanceRecord | null> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data: emp, error: empErr } = await supabase
        .from('employees')
        .select('id')
        .or(`id.eq.${employeeId},employee_code.eq.${employeeId}`)
        .maybeSingle();

      if (empErr || !emp) return null;

      const { data, error } = await supabase
        .from('attendance')
        .select('*')
        .eq('employee_id', emp.id)
        .eq('attendance_date', today)
        .maybeSingle();

      if (error) {
        console.warn('Error fetching today attendance:', error.message);
        return null;
      }

      return data ? this.mapDbRecord(data) : null;
    } catch (err) {
      console.warn('Unhandled exception in getTodayRecord:', err);
      return null;
    }
  },

  async getAllAttendance(date?: string): Promise<AttendanceRecord[]> {
    try {
      const targetDate = date ?? new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('attendance')
        .select('*, employees(*)')
        .eq('attendance_date', targetDate);

      if (error) {
        console.warn('Error getting all attendance:', error.message);
        return [];
      }

      return (data || []).map((r: any) => ({
        id: r.id,
        employeeId: r.employees?.employee_code || '',
        employeeName: `${r.employees?.first_name || ''} ${r.employees?.last_name || ''}`.trim(),
        department: r.employees?.department_id || 'Operations',
        date: r.attendance_date,
        checkInTime: r.check_in ? new Date(r.check_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : undefined,
        checkOutTime: r.check_out ? new Date(r.check_out).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : undefined,
        workingHours: r.working_minutes ? Math.round((r.working_minutes / 60) * 10) / 10 : undefined,
        status: this.mapDbStatus(r.status),
        notes: r.notes || '',
      }));
    } catch (err) {
      console.warn('Unhandled exception in getAllAttendance:', err);
      return [];
    }
  },

  async getEmployeeAttendanceHistory(employeeId: string): Promise<AttendanceRecord[]> {
    try {
      const { data: emp, error: empErr } = await supabase
        .from('employees')
        .select('id')
        .or(`id.eq.${employeeId},employee_code.eq.${employeeId}`)
        .maybeSingle();

      if (empErr || !emp) return [];

      const { data, error } = await supabase
        .from('attendance')
        .select('*')
        .eq('employee_id', emp.id)
        .order('attendance_date', { ascending: false });

      if (error) {
        console.warn('Error fetching attendance history:', error.message);
        return [];
      }

      return (data || []).map(this.mapDbRecord);
    } catch (err) {
      console.warn('Unhandled exception in getEmployeeAttendanceHistory:', err);
      return [];
    }
  },

  async checkIn(employee: Employee): Promise<AttendanceRecord> {
    const today = new Date().toISOString().split('T')[0];
    const checkInTime = new Date().toISOString();

    const { data: emp, error: empErr } = await supabase
      .from('employees')
      .select('id, first_name, last_name, department_id, work_mode, wfh_exception_active')
      .or(`id.eq.${employee.id},employee_code.eq.${employee.employeeId}`)
      .maybeSingle();

    if (empErr || !emp) throw new Error('Employee record not found in Supabase.');

    // Check if record already exists
    const existing = await this.getTodayRecord(emp.id);
    if (existing && existing.checkInTime) {
      throw new Error('You have already checked in for today.');
    }

    // IP Validation & Work Mode Verification
    const currentIp = await officeService.getClientIp();
    const offices = await officeService.getOfficeLocations();
    const allowedIps = offices.flatMap(o => o.allowedIpAddresses);

    let isVerified = false;
    let verificationMethod: 'office_wifi' | 'wfh_exception' | 'remote_allowed' | 'manual_override' = 'office_wifi';

    if (emp.work_mode === 'Remote') {
      isVerified = true;
      verificationMethod = 'remote_allowed';
    } else if (emp.wfh_exception_active) {
      isVerified = true;
      verificationMethod = 'wfh_exception';
    } else if (allowedIps.includes('*') || allowedIps.includes('127.0.0.1') || allowedIps.includes(currentIp)) {
      isVerified = true;
      verificationMethod = 'office_wifi';
    } else {
      throw new Error(`Location Check-in Rejected: You are connected from IP (${currentIp}), which is not an approved Office Wi-Fi network. Please connect to Office Wi-Fi or request a WFH Exception from HR.`);
    }

    const { data, error } = await supabase
      .from('attendance')
      .insert({
        employee_id: emp.id,
        attendance_date: today,
        check_in: checkInTime,
        status: 'present',
        notes: `Checked in via ${verificationMethod} (${currentIp})`,
        ip_address: currentIp,
        is_verified_location: isVerified,
        verification_method: verificationMethod,
      })
      .select()
      .single();

    if (error) {
      console.error('Check in failed:', error.message);
      throw new Error(error.message);
    }

    return this.mapDbRecord(data);
  },

  async checkOut(employeeId: string): Promise<AttendanceRecord> {
    const today = new Date().toISOString().split('T')[0];
    const checkOutTime = new Date().toISOString();

    const { data: emp, error: empErr } = await supabase
      .from('employees')
      .select('id')
      .or(`id.eq.${employeeId},employee_code.eq.${employeeId}`)
      .maybeSingle();

    if (empErr || !emp) throw new Error('Employee record not found.');

    const { data: attendanceRecord, error: fetchError } = await supabase
      .from('attendance')
      .select('*')
      .eq('employee_id', emp.id)
      .eq('attendance_date', today)
      .maybeSingle();

    if (fetchError || !attendanceRecord || !attendanceRecord.check_in) {
      throw new Error('No check-in record found for today.');
    }

    if (attendanceRecord.check_out) {
      throw new Error('You have already checked out for today.');
    }

    // Calculate working duration
    const inTime = new Date(attendanceRecord.check_in);
    const outTime = new Date(checkOutTime);
    const diffMs = outTime.getTime() - inTime.getTime();
    const workingMinutes = Math.max(30, Math.round(diffMs / (1000 * 60)));

    const { data, error } = await supabase
      .from('attendance')
      .update({
        check_out: checkOutTime,
        working_minutes: workingMinutes,
        notes: `Shift check-in at ${inTime.toLocaleTimeString()} and check-out at ${outTime.toLocaleTimeString()}`,
      })
      .eq('id', attendanceRecord.id)
      .select()
      .single();

    if (error) {
      console.error('Check out failed:', error.message);
      throw new Error(error.message);
    }

    return this.mapDbRecord(data);
  },

  async getAttendanceSummary(date?: string): Promise<AttendanceSummary> {
    try {
      const targetDate = date ?? new Date().toISOString().split('T')[0];
      const records = await this.getAllAttendance(targetDate);
      const { count: totalEmployees } = await supabase
        .from('employees')
        .select('*', { count: 'exact', head: true });

      return {
        present: records.filter(r => r.status === 'Present').length,
        absent: records.filter(r => r.status === 'Absent').length,
        halfDay: records.filter(r => r.status === 'Half Day').length,
        onLeave: records.filter(r => r.status === 'On Leave').length,
        total: totalEmployees || records.length || 0,
      };
    } catch (err) {
      console.warn('Unhandled exception in getAttendanceSummary:', err);
      return { present: 0, absent: 0, halfDay: 0, onLeave: 0, total: 0 };
    }
  },

  mapDbRecord(r: any): AttendanceRecord {
    return {
      id: r.id,
      employeeId: r.employee_id,
      employeeName: r.employee_name || '',
      department: r.department || '',
      date: r.attendance_date,
      checkInTime: r.check_in ? new Date(r.check_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : undefined,
      checkOutTime: r.check_out ? new Date(r.check_out).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : undefined,
      workingHours: r.working_minutes ? Math.round((r.working_minutes / 60) * 10) / 10 : undefined,
      status: this.mapDbStatus(r.status),
      notes: r.notes || '',
      ipAddress: r.ip_address || undefined,
      isVerifiedLocation: r.is_verified_location ?? true,
      verificationMethod: r.verification_method || 'office_wifi',
    };
  },

  mapDbStatus(status: string): any {
    switch (status) {
      case 'present': return 'Present';
      case 'absent': return 'Absent';
      case 'half_day': return 'Half Day';
      case 'leave': return 'On Leave';
      default: return 'Absent';
    }
  },
};
