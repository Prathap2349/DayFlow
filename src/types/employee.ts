// src/types/employee.ts
export type EmployeeStatus = 'Active' | 'On Leave' | 'Absent' | 'Inactive';

export interface EmployeeDocument {
  id: string;
  name: string;
  type: string; // e.g. 'ID Proof', 'Offer Letter', 'Contract', 'Tax Form'
  uploadDate: string;
  fileUrl?: string;
  size?: string;
}

export interface Employee {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  phone: string;
  dateOfBirth?: string;
  gender?: 'Male' | 'Female' | 'Non-binary' | 'Other';
  address?: string;
  department: string;
  jobTitle: string;
  status: EmployeeStatus;
  avatar?: string;
  location?: string;
  joinDate: string;
  employmentType?: 'Full-time' | 'Part-time' | 'Contract' | 'Intern';
  manager?: string;
  attendanceRate: number; // percentage 0-100
  leaveBalance: number;   // days
  basicSalary?: number;
  allowances?: number;
  deductions?: number;
  netSalary?: number;
  documents?: EmployeeDocument[];
  role: 'employee' | 'hr' | 'admin';
}
