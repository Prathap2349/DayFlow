// src/types/payroll.ts
export interface SalaryStructure {
  employeeId: string;
  basicSalary: number;
  hra: number;
  specialAllowance: number;
  medicalAllowance: number;
  conveyance: number;
  providentFund: number;
  professionalTax: number;
  incomeTax: number;
  netSalary: number;
  currency: string;
}

export interface Payslip {
  id: string;
  employeeId: string;
  employeeName: string;
  month: string; // e.g. "August 2026"
  payPeriod: string; // "Aug 1, 2026 - Aug 31, 2026"
  paymentDate: string;
  status: 'Paid' | 'Processing' | 'Pending';
  basicSalary: number;
  allowances: number;
  deductions: number;
  netSalary: number;
  bankName?: string;
  accountNumber?: string;
}
