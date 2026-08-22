// src/services/payrollService.ts
import { supabase } from '../db/supabaseClient';
import type { Payslip, SalaryStructure } from '../types/payroll';
import type { Employee } from '../types/employee';

export const payrollService = {
  async getEmployeePayslips(employeeId: string): Promise<Payslip[]> {
    // Resolve employee DB UUID first
    const { data: emp } = await supabase
      .from('employees')
      .select('id')
      .or(`id.eq.${employeeId},employee_code.eq.${employeeId}`)
      .maybeSingle();

    if (!emp) return [];

    const { data, error } = await supabase
      .from('payroll_records')
      .select('*, employees(*)')
      .eq('employee_id', emp.id)
      .order('pay_period_start', { ascending: false });

    if (error) {
      console.error('Error getting payslips:', error.message);
      throw new Error(error.message);
    }

    return (data || []).map(this.mapDbRecord);
  },

  async getAllPayslips(): Promise<Payslip[]> {
    const { data, error } = await supabase
      .from('payroll_records')
      .select('*, employees(*)')
      .order('pay_period_start', { ascending: false });

    if (error) {
      console.error('Error getting all payslips:', error.message);
      throw new Error(error.message);
    }

    return (data || []).map(this.mapDbRecord);
  },

  async getSalaryStructure(employeeId: string): Promise<SalaryStructure | null> {
    const { data: emp, error } = await supabase
      .from('employees')
      .select('*')
      .or(`id.eq.${employeeId},employee_code.eq.${employeeId}`)
      .maybeSingle();

    if (error || !emp) return null;

    const basic = Number(emp.basic_salary || 0);
    const allowances = Number(emp.hra || 0) + Number(emp.special_allowance || 0) + Number(emp.other_allowances || 0);
    const deductions = Number(emp.pf_deduction || 0) + Number(emp.tax_deduction || 0) + Number(emp.other_deductions || 0);

    return {
      employeeId: emp.employee_code,
      basicSalary: basic,
      hra: Number(emp.hra || 0),
      specialAllowance: Number(emp.special_allowance || 0),
      medicalAllowance: 2000,
      conveyance: 1600,
      providentFund: Number(emp.pf_deduction || 0),
      professionalTax: 200,
      incomeTax: Number(emp.tax_deduction || 0),
      netSalary: Number(emp.net_salary || basic + allowances - deductions),
      currency: 'INR (₹)',
    };
  },

  async updateSalaryStructure(
    employeeId: string,
    salaryData: { basicSalary: number; allowances: number; deductions: number }
  ): Promise<Employee> {
    const basic = salaryData.basicSalary;
    const hra = Math.round(basic * 0.4);
    const special = salaryData.allowances - hra;

    const pf = Math.round(basic * 0.12);
    const tax = salaryData.deductions - pf;

    const net = basic + salaryData.allowances - salaryData.deductions;

    const { data: emp, error: fetchErr } = await supabase
      .from('employees')
      .select('id')
      .or(`id.eq.${employeeId},employee_code.eq.${employeeId}`)
      .maybeSingle();

    if (fetchErr || !emp) throw new Error('Employee record not found.');

    const { data: updated, error } = await supabase
      .from('employees')
      .update({
        basic_salary: basic,
        hra: hra,
        special_allowance: special,
        pf_deduction: pf,
        tax_deduction: tax,
        net_salary: net,
      })
      .eq('id', emp.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating salary structure:', error.message);
      throw new Error(error.message);
    }

    // Insert a payroll record for reference if needed, or let database generate
    return {
      id: updated.id,
      employeeId: updated.employee_code,
      firstName: updated.first_name,
      lastName: updated.last_name || '',
      name: `${updated.first_name} ${updated.last_name || ''}`.trim(),
      email: updated.email,
      phone: updated.phone || '',
      department: updated.department_id || 'Operations',
      jobTitle: updated.job_title || '',
      status: updated.employment_status || 'Active',
      joinDate: updated.joining_date,
      attendanceRate: 100,
      leaveBalance: updated.leave_balance || 18,
      basicSalary: Number(updated.basic_salary),
      allowances: Number(updated.hra) + Number(updated.special_allowance),
      deductions: Number(updated.pf_deduction) + Number(updated.tax_deduction),
      netSalary: Number(updated.net_salary),
      role: 'employee',
    };
  },

  mapDbRecord(r: any): Payslip {
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const periodStart = new Date(r.pay_period_start);
    const monthStr = `${monthNames[periodStart.getMonth()]} ${periodStart.getFullYear()}`;

    return {
      id: r.id,
      employeeId: r.employees?.employee_code || '',
      employeeName: `${r.employees?.first_name || ''} ${r.employees?.last_name || ''}`.trim(),
      month: monthStr,
      payPeriod: `${r.pay_period_start} - ${r.pay_period_end}`,
      paymentDate: r.payment_date || '—',
      status: r.payment_status,
      basicSalary: Number(r.basic_salary),
      allowances: Number(r.hra) + Number(r.special_allowance) + Number(r.other_earnings || 0),
      deductions: Number(r.pf_deduction) + Number(r.tax_deduction) + Number(r.other_deductions || 0),
      netSalary: Number(r.net_salary),
      bankName: 'HDFC Bank',
      accountNumber: '••••••••4829',
    };
  },
};
