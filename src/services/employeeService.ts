// src/services/employeeService.ts
import { supabase } from '../db/supabaseClient';
import type { Employee } from '../types/employee';

export const employeeService = {
  async getEmployees(): Promise<Employee[]> {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*, departments(*)')
        .order('first_name', { ascending: true });

      if (error) {
        console.warn('Error fetching employees from Supabase:', error.message);
        return [];
      }

      return (data || []).map(this.mapDbRecord);
    } catch (err) {
      console.warn('Unhandled exception in getEmployees:', err);
      return [];
    }
  },

  async getEmployeeById(idOrCode: string): Promise<Employee | null> {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*, departments(*)')
        .or(`id.eq.${idOrCode},employee_code.eq.${idOrCode}`)
        .maybeSingle();

      if (error) {
        console.warn('Error fetching employee details:', error.message);
        return null;
      }

      return data ? this.mapDbRecord(data) : null;
    } catch (err) {
      console.warn('Unhandled exception in getEmployeeById:', err);
      return null;
    }
  },

  async createEmployee(data: Omit<Employee, 'id'>): Promise<Employee> {
    const dbRecord = this.mapToDbRecord(data);
    const { data: created, error } = await supabase
      .from('employees')
      .insert(dbRecord)
      .select()
      .single();

    if (error) {
      console.error('Error creating employee:', error.message);
      throw new Error(error.message);
    }

    return this.mapDbRecord(created);
  },

  async updateEmployee(id: string, updates: Partial<Employee>): Promise<Employee> {
    const dbUpdates = this.mapToDbRecord(updates);
    const { data: updated, error } = await supabase
      .from('employees')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating employee:', error.message);
      throw new Error(error.message);
    }

    return this.mapDbRecord(updated);
  },

  async toggleEmployeeStatus(id: string): Promise<Employee> {
    const emp = await this.getEmployeeById(id);
    if (!emp) throw new Error('Employee not found');
    const newStatus = emp.status === 'Active' ? 'Inactive' : 'Active';
    return this.updateEmployee(emp.id, { status: newStatus });
  },

  async deleteEmployee(id: string): Promise<void> {
    const { error } = await supabase
      .from('employees')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting employee:', error.message);
      throw new Error(error.message);
    }
  },

  // Helper mapping functions
  mapDbRecord(db: any): Employee {
    return {
      id: db.id,
      employeeId: db.employee_code,
      firstName: db.first_name,
      lastName: db.last_name || '',
      name: `${db.first_name} ${db.last_name || ''}`.trim(),
      email: db.email,
      phone: db.phone || '',
      dateOfBirth: db.date_of_birth || undefined,
      gender: db.gender || undefined,
      address: db.address || '',
      department: db.departments?.name || 'Operations',
      jobTitle: db.job_title || 'Software Engineer',
      status: db.employment_status || 'Active',
      avatar: db.profile_picture_url || undefined,
      location: db.work_location || 'Bengaluru',
      joinDate: db.joining_date,
      employmentType: db.employment_type || 'Full-time',
      manager: db.manager_id || undefined,
      attendanceRate: db.attendance_rate || 95,
      leaveBalance: db.leave_balance || 18,
      basicSalary: Number(db.basic_salary || 0),
      allowances: Number(db.hra || 0) + Number(db.special_allowance || 0) + Number(db.other_allowances || 0),
      deductions: Number(db.pf_deduction || 0) + Number(db.tax_deduction || 0) + Number(db.other_deductions || 0),
      netSalary: Number(db.net_salary || 0),
      role: 'employee',
    };
  },

  mapToDbRecord(emp: Partial<Employee>): any {
    const result: any = {};
    if (emp.employeeId !== undefined) result.employee_code = emp.employeeId;
    if (emp.firstName !== undefined) result.first_name = emp.firstName;
    if (emp.lastName !== undefined) result.last_name = emp.lastName;
    if (emp.email !== undefined) result.email = emp.email;
    if (emp.phone !== undefined) result.phone = emp.phone;
    if (emp.dateOfBirth !== undefined) result.date_of_birth = emp.dateOfBirth;
    if (emp.gender !== undefined) result.gender = emp.gender;
    if (emp.address !== undefined) result.address = emp.address;
    if (emp.avatar !== undefined) result.profile_picture_url = emp.avatar;
    if (emp.jobTitle !== undefined) result.job_title = emp.jobTitle;
    if (emp.location !== undefined) result.work_location = emp.location;
    if (emp.joinDate !== undefined) result.joining_date = emp.joinDate;
    if (emp.employmentType !== undefined) result.employment_type = emp.employmentType;
    if (emp.status !== undefined) result.employment_status = emp.status;

    if (emp.basicSalary !== undefined) result.basic_salary = emp.basicSalary;
    if (emp.allowances !== undefined) {
      result.hra = Math.round(emp.basicSalary ? emp.basicSalary * 0.4 : emp.allowances * 0.4);
      result.special_allowance = emp.allowances - result.hra;
    }
    if (emp.deductions !== undefined) {
      result.pf_deduction = Math.round(emp.basicSalary ? emp.basicSalary * 0.12 : emp.deductions * 0.5);
      result.tax_deduction = emp.deductions - result.pf_deduction;
    }
    if (emp.netSalary !== undefined) result.net_salary = emp.netSalary;
    return result;
  },
};
