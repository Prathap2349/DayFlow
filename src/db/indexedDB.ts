// src/db/indexedDB.ts
import type { Employee } from '../types/employee';
import type { AttendanceRecord, ActivityItem } from '../types/attendance';
import type { LeaveRequest } from '../types/leave';
import type { SalaryStructure, Payslip } from '../types/payroll';
import type { NotificationItem } from '../types/notification';
import type { UserSettings, CompanySettings } from '../types/settings';

export interface DBStores {
  employees: Employee;
  attendance: AttendanceRecord;
  leaves: LeaveRequest;
  payroll: SalaryStructure;
  payslips: Payslip;
  notifications: NotificationItem;
  activity: ActivityItem;
  userSettings: UserSettings;
  companySettings: CompanySettings;
}

// Initial Seed Data
export const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: 'usr_001',
    employeeId: 'EMP001',
    firstName: 'Arjun',
    lastName: 'Kumar',
    name: 'Arjun Kumar',
    email: 'employee@dayflow.demo',
    phone: '+91 98765 43210',
    dateOfBirth: '1995-06-12',
    gender: 'Male',
    address: '102, Indiranagar 100ft Road, Bengaluru, Karnataka 560038',
    department: 'Engineering',
    jobTitle: 'Software Engineer',
    status: 'Active',
    location: 'Bengaluru',
    joinDate: '2022-03-15',
    employmentType: 'Full-time',
    manager: 'Rohan Mehta',
    attendanceRate: 92,
    leaveBalance: 12,
    basicSalary: 65000,
    allowances: 25000,
    deductions: 8000,
    netSalary: 82000,
    role: 'employee',
    documents: [
      { id: 'doc_1', name: 'Government_ID_Aadhaar.pdf', type: 'ID Proof', uploadDate: '2022-03-15', size: '1.2 MB' },
      { id: 'doc_2', name: 'Employment_Offer_Letter.pdf', type: 'Contract', uploadDate: '2022-03-10', size: '850 KB' },
    ],
  },
  {
    id: 'usr_002',
    employeeId: 'HR001',
    firstName: 'Priya',
    lastName: 'Sharma',
    name: 'Priya Sharma',
    email: 'hr@dayflow.demo',
    phone: '+91 98765 00000',
    dateOfBirth: '1990-11-24',
    gender: 'Female',
    address: '405, Bandra West, Mumbai, Maharashtra 400050',
    department: 'Human Resources',
    jobTitle: 'HR Administrator',
    status: 'Active',
    location: 'Mumbai',
    joinDate: '2020-01-10',
    employmentType: 'Full-time',
    manager: 'CEO',
    attendanceRate: 98,
    leaveBalance: 15,
    basicSalary: 85000,
    allowances: 35000,
    deductions: 12000,
    netSalary: 108000,
    role: 'admin',
    documents: [
      { id: 'doc_3', name: 'HR_Certification.pdf', type: 'Certificate', uploadDate: '2020-01-10', size: '2.1 MB' },
    ],
  },
  {
    id: 'emp_002',
    employeeId: 'EMP002',
    firstName: 'Sneha',
    lastName: 'Patel',
    name: 'Sneha Patel',
    email: 'sneha.patel@dayflow.demo',
    phone: '+91 87654 32109',
    dateOfBirth: '1993-08-19',
    gender: 'Female',
    address: '204, Powai Heights, Mumbai, Maharashtra',
    department: 'Design',
    jobTitle: 'UI/UX Designer',
    status: 'Active',
    location: 'Mumbai',
    joinDate: '2021-07-01',
    employmentType: 'Full-time',
    manager: 'Priya Sharma',
    attendanceRate: 97,
    leaveBalance: 8,
    basicSalary: 60000,
    allowances: 20000,
    deductions: 7000,
    netSalary: 73000,
    role: 'employee',
  },
  {
    id: 'emp_003',
    employeeId: 'EMP003',
    firstName: 'Rahul',
    lastName: 'Verma',
    name: 'Rahul Verma',
    email: 'rahul.verma@dayflow.demo',
    phone: '+91 76543 21098',
    dateOfBirth: '1994-04-05',
    gender: 'Male',
    address: '55, Hitech City, Hyderabad, Telangana',
    department: 'Engineering',
    jobTitle: 'Backend Developer',
    status: 'Active',
    location: 'Hyderabad',
    joinDate: '2023-01-10',
    employmentType: 'Full-time',
    manager: 'Rohan Mehta',
    attendanceRate: 89,
    leaveBalance: 15,
    basicSalary: 70000,
    allowances: 22000,
    deductions: 9000,
    netSalary: 83000,
    role: 'employee',
  },
  {
    id: 'emp_004',
    employeeId: 'EMP004',
    firstName: 'Anjali',
    lastName: 'Singh',
    name: 'Anjali Singh',
    email: 'anjali.singh@dayflow.demo',
    phone: '+91 65432 10987',
    dateOfBirth: '1992-09-14',
    gender: 'Female',
    address: '12, Connaught Place, New Delhi',
    department: 'Marketing',
    jobTitle: 'Marketing Manager',
    status: 'On Leave',
    location: 'Delhi',
    joinDate: '2020-09-20',
    employmentType: 'Full-time',
    manager: 'Vikram Nair',
    attendanceRate: 85,
    leaveBalance: 3,
    basicSalary: 75000,
    allowances: 25000,
    deductions: 10000,
    netSalary: 90000,
    role: 'employee',
  },
  {
    id: 'emp_005',
    employeeId: 'EMP005',
    firstName: 'Vikram',
    lastName: 'Nair',
    name: 'Vikram Nair',
    email: 'vikram.nair@dayflow.demo',
    phone: '+91 54321 09876',
    dateOfBirth: '1988-02-28',
    gender: 'Male',
    address: '88, T. Nagar, Chennai, Tamil Nadu',
    department: 'Marketing',
    jobTitle: 'VP Marketing',
    status: 'Active',
    location: 'Chennai',
    joinDate: '2019-04-05',
    employmentType: 'Full-time',
    manager: 'Suresh Iyer',
    attendanceRate: 96,
    leaveBalance: 6,
    basicSalary: 110000,
    allowances: 40000,
    deductions: 18000,
    netSalary: 132000,
    role: 'employee',
  },
  {
    id: 'emp_006',
    employeeId: 'EMP006',
    firstName: 'Divya',
    lastName: 'Reddy',
    name: 'Divya Reddy',
    email: 'divya.reddy@dayflow.demo',
    phone: '+91 43210 98765',
    dateOfBirth: '1996-12-01',
    gender: 'Female',
    address: '301, Viman Nagar, Pune, Maharashtra',
    department: 'Finance',
    jobTitle: 'Financial Analyst',
    status: 'Active',
    location: 'Pune',
    joinDate: '2022-11-14',
    employmentType: 'Full-time',
    manager: 'Suresh Iyer',
    attendanceRate: 98,
    leaveBalance: 14,
    basicSalary: 62000,
    allowances: 18000,
    deductions: 7500,
    netSalary: 72500,
    role: 'employee',
  },
  {
    id: 'emp_007',
    employeeId: 'EMP007',
    firstName: 'Karthik',
    lastName: 'Rajan',
    name: 'Karthik Rajan',
    email: 'karthik.rajan@dayflow.demo',
    phone: '+91 32109 87654',
    dateOfBirth: '1993-07-22',
    gender: 'Male',
    address: '42, Koramangala 4th Block, Bengaluru',
    department: 'Engineering',
    jobTitle: 'DevOps Engineer',
    status: 'Active',
    location: 'Bengaluru',
    joinDate: '2021-02-22',
    employmentType: 'Full-time',
    manager: 'Rohan Mehta',
    attendanceRate: 91,
    leaveBalance: 10,
    basicSalary: 78000,
    allowances: 26000,
    deductions: 10500,
    netSalary: 93500,
    role: 'employee',
  },
];

export const INITIAL_ATTENDANCE: AttendanceRecord[] = [
  {
    id: 'att_001',
    employeeId: 'EMP001',
    employeeName: 'Arjun Kumar',
    department: 'Engineering',
    date: new Date().toISOString().split('T')[0],
    checkInTime: '09:04 AM',
    workingHours: 4.5,
    status: 'Present',
    notes: 'Checked in on time',
  },
  {
    id: 'att_002',
    employeeId: 'EMP002',
    employeeName: 'Sneha Patel',
    department: 'Design',
    date: new Date().toISOString().split('T')[0],
    checkInTime: '08:55 AM',
    workingHours: 4.6,
    status: 'Present',
  },
  {
    id: 'att_003',
    employeeId: 'EMP003',
    employeeName: 'Rahul Verma',
    department: 'Engineering',
    date: new Date().toISOString().split('T')[0],
    checkInTime: '09:15 AM',
    workingHours: 4.2,
    status: 'Present',
  },
  {
    id: 'att_004',
    employeeId: 'EMP004',
    employeeName: 'Anjali Singh',
    department: 'Marketing',
    date: new Date().toISOString().split('T')[0],
    status: 'On Leave',
    notes: 'Approved Annual Leave',
  },
  {
    id: 'att_005',
    employeeId: 'EMP005',
    employeeName: 'Vikram Nair',
    department: 'Marketing',
    date: new Date().toISOString().split('T')[0],
    checkInTime: '09:00 AM',
    workingHours: 4.5,
    status: 'Present',
  },
  {
    id: 'att_006',
    employeeId: 'EMP006',
    employeeName: 'Divya Reddy',
    department: 'Finance',
    date: new Date().toISOString().split('T')[0],
    checkInTime: '09:10 AM',
    workingHours: 4.3,
    status: 'Present',
  },
  {
    id: 'att_007',
    employeeId: 'EMP007',
    employeeName: 'Karthik Rajan',
    department: 'Engineering',
    date: new Date().toISOString().split('T')[0],
    status: 'Absent',
  },
];

export const INITIAL_LEAVES: LeaveRequest[] = [
  {
    id: 'leave_001',
    employeeId: 'EMP004',
    employeeName: 'Anjali Singh',
    department: 'Marketing',
    leaveType: 'Paid',
    startDate: '2026-08-20',
    endDate: '2026-08-27',
    days: 6,
    reason: 'Family vacation planned for festival season.',
    status: 'Pending',
    appliedOn: '2026-08-15',
  },
  {
    id: 'leave_002',
    employeeId: 'EMP001',
    employeeName: 'Arjun Kumar',
    department: 'Engineering',
    leaveType: 'Sick',
    startDate: '2026-08-24',
    endDate: '2026-08-25',
    days: 2,
    reason: 'Fever and doctor advised medical rest.',
    status: 'Pending',
    appliedOn: '2026-08-21',
  },
  {
    id: 'leave_003',
    employeeId: 'EMP002',
    employeeName: 'Sneha Patel',
    department: 'Design',
    leaveType: 'Casual',
    startDate: '2026-08-10',
    endDate: '2026-08-10',
    days: 1,
    reason: 'Personal work at hometown.',
    status: 'Approved',
    appliedOn: '2026-08-08',
    reviewedBy: 'Priya Sharma',
    reviewedOn: '2026-08-09',
  },
  {
    id: 'leave_004',
    employeeId: 'EMP003',
    employeeName: 'Rahul Verma',
    department: 'Engineering',
    leaveType: 'Paid',
    startDate: '2026-09-01',
    endDate: '2026-09-05',
    days: 5,
    reason: 'Travel for sibling wedding ceremony.',
    status: 'Pending',
    appliedOn: '2026-08-19',
  },
];

export const INITIAL_PAYSLIPS: Payslip[] = [
  {
    id: 'pay_001',
    employeeId: 'EMP001',
    employeeName: 'Arjun Kumar',
    month: 'July 2026',
    payPeriod: 'Jul 1, 2026 - Jul 31, 2026',
    paymentDate: '2026-08-01',
    status: 'Paid',
    basicSalary: 65000,
    allowances: 25000,
    deductions: 8000,
    netSalary: 82000,
    bankName: 'HDFC Bank',
    accountNumber: '••••••••4829',
  },
  {
    id: 'pay_002',
    employeeId: 'EMP001',
    employeeName: 'Arjun Kumar',
    month: 'June 2026',
    payPeriod: 'Jun 1, 2026 - Jun 30, 2026',
    paymentDate: '2026-07-01',
    status: 'Paid',
    basicSalary: 65000,
    allowances: 25000,
    deductions: 8000,
    netSalary: 82000,
    bankName: 'HDFC Bank',
    accountNumber: '••••••••4829',
  },
  {
    id: 'pay_003',
    employeeId: 'EMP002',
    employeeName: 'Sneha Patel',
    month: 'July 2026',
    payPeriod: 'Jul 1, 2026 - Jul 31, 2026',
    paymentDate: '2026-08-01',
    status: 'Paid',
    basicSalary: 60000,
    allowances: 20000,
    deductions: 7000,
    netSalary: 73000,
    bankName: 'ICICI Bank',
    accountNumber: '••••••••9102',
  },
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif_1',
    recipientId: 'all',
    type: 'hr_announcement',
    title: 'Company Holiday Announcement',
    message: 'Dayflow office will remain closed on August 26 for Independence Day observance.',
    timestamp: '2026-08-22T08:00:00Z',
    read: false,
  },
  {
    id: 'notif_2',
    recipientId: 'EMP001',
    type: 'leave_pending',
    title: 'Leave Request Received',
    message: 'Your leave request for Aug 24 - Aug 25 is currently under HR review.',
    timestamp: '2026-08-21T14:30:00Z',
    read: false,
    link: '/employee/leave',
  },
  {
    id: 'notif_3',
    recipientId: 'EMP001',
    type: 'payroll_update',
    title: 'Salary Slip Available',
    message: 'Your payslip for July 2026 is now ready for viewing and download.',
    timestamp: '2026-08-01T09:00:00Z',
    read: true,
    link: '/employee/payroll',
  },
];

class LocalDatabase {
  private getStorage<T>(key: string, defaultValue: T[]): T[] {
    try {
      const item = localStorage.getItem(`dayflow_${key}`);
      if (!item) {
        localStorage.setItem(`dayflow_${key}`, JSON.stringify(defaultValue));
        return defaultValue;
      }
      return JSON.parse(item) as T[];
    } catch {
      return defaultValue;
    }
  }

  private setStorage<T>(key: string, value: T[]): void {
    try {
      localStorage.setItem(`dayflow_${key}`, JSON.stringify(value));
    } catch (e) {
      console.error(`Failed saving ${key} to storage`, e);
    }
  }

  getEmployees(): Employee[] {
    return this.getStorage<Employee>('employees', INITIAL_EMPLOYEES);
  }
  saveEmployees(employees: Employee[]): void {
    this.setStorage('employees', employees);
  }

  getAttendance(): AttendanceRecord[] {
    return this.getStorage<AttendanceRecord>('attendance', INITIAL_ATTENDANCE);
  }
  saveAttendance(attendance: AttendanceRecord[]): void {
    this.setStorage('attendance', attendance);
  }

  getLeaves(): LeaveRequest[] {
    return this.getStorage<LeaveRequest>('leaves', INITIAL_LEAVES);
  }
  saveLeaves(leaves: LeaveRequest[]): void {
    this.setStorage('leaves', leaves);
  }

  getPayslips(): Payslip[] {
    return this.getStorage<Payslip>('payslips', INITIAL_PAYSLIPS);
  }
  savePayslips(payslips: Payslip[]): void {
    this.setStorage('payslips', payslips);
  }

  getNotifications(): NotificationItem[] {
    return this.getStorage<NotificationItem>('notifications', INITIAL_NOTIFICATIONS);
  }
  saveNotifications(notifs: NotificationItem[]): void {
    this.setStorage('notifications', notifs);
  }
}

export const db = new LocalDatabase();
