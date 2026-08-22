// src/types/attendance.ts
export type AttendanceStatus = 'Present' | 'Absent' | 'Half Day' | 'On Leave';

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  date: string; // YYYY-MM-DD
  checkInTime?: string; // HH:mm AM/PM
  checkOutTime?: string; // HH:mm AM/PM
  workingHours?: number; // float hours (e.g. 8.5)
  status: AttendanceStatus;
  notes?: string;
  ipAddress?: string;
  isVerifiedLocation?: boolean;
  verificationMethod?: 'office_wifi' | 'wfh_exception' | 'remote_allowed' | 'geo_location' | 'manual_override';
}

export interface AttendanceSummary {
  present: number;
  absent: number;
  halfDay: number;
  onLeave: number;
  total: number;
}

export interface ActivityItem {
  id: string;
  employeeId?: string;
  description: string;
  time: string;
  date: string;
  type: 'checkin' | 'checkout' | 'leave' | 'profile' | 'approval' | 'info';
}
