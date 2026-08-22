// src/pages/admin/EmployeesPage.tsx
import { useState, useEffect } from 'react';
import {
  UserPlus, Search, Filter, Eye, Edit, Trash2, Power,
  X, Building, DollarSign, FileText, User as UserIcon, ChevronLeft, ChevronRight, Upload, AlertTriangle, CheckCircle2
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge, StatusBadge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { employeeService } from '../../services/employeeService';
import type { Employee, EmployeeStatus } from '../../types/employee';
import toast from 'react-hot-toast';
import Papa from 'papaparse';

const DEPARTMENTS = ['All', 'Engineering', 'Design', 'Marketing', 'Finance', 'Human Resources', 'Operations'];
const STATUSES = ['All', 'Active', 'On Leave', 'Absent', 'Inactive'];
const ITEMS_PER_PAGE = 7;

export function AdminEmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [page, setPage] = useState(1);

  // Modals & Drawers
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [viewDetailModalOpen, setViewDetailModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  // Import State
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importStep, setImportStep] = useState(1); // 1: Upload, 2: Mapping, 3: Validation, 4: Result
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [parsedHeaders, setParsedHeaders] = useState<string[]>([]);
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});
  const [validationResult, setValidationResult] = useState<{
    valid: any[];
    invalid: { row: number; errors: string[]; data: any }[];
    duplicates: { row: number; errors: string[]; data: any }[];
  }>({ valid: [], invalid: [], duplicates: [] });
  const [duplicateAction, setDuplicateAction] = useState<'Skip' | 'Update'>('Skip');
  const [importSummary, setImportSummary] = useState({ success: 0, skipped: 0, failed: 0 });

  // Form State for Add / Edit
  const [formData, setFormData] = useState<{
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    employeeId: string;
    department: string;
    jobTitle: string;
    employmentType: 'Full-time' | 'Part-time' | 'Contract' | 'Intern';
    manager: string;
    location: string;
    joinDate: string;
    basicSalary: number;
    allowances: number;
    deductions: number;
    status: EmployeeStatus;
    role: 'employee' | 'hr' | 'admin';
  }>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    employeeId: '',
    department: 'Engineering',
    jobTitle: 'Software Engineer',
    employmentType: 'Full-time',
    manager: 'Rohan Mehta',
    location: 'Bengaluru',
    joinDate: new Date().toISOString().split('T')[0],
    basicSalary: 65000,
    allowances: 25000,
    deductions: 8000,
    status: 'Active',
    role: 'employee',
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await employeeService.getEmployees();
      setEmployees(data);
    } catch (e) {
      toast.error('Failed loading employees');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtered list
  const filtered = employees.filter(emp => {
    const matchesSearch =
      emp.name.toLowerCase().includes(search.toLowerCase()) ||
      emp.employeeId.toLowerCase().includes(search.toLowerCase()) ||
      emp.email.toLowerCase().includes(search.toLowerCase()) ||
      emp.department.toLowerCase().includes(search.toLowerCase());
    const matchesDept = deptFilter === 'All' || emp.department === deptFilter;
    const matchesStatus = statusFilter === 'All' || emp.status === statusFilter;
    return matchesSearch && matchesDept && matchesStatus;
  });

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE) || 1;
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      employeeId: `EMP${Math.floor(100 + Math.random() * 900)}`,
      department: 'Engineering',
      jobTitle: 'Software Engineer',
      employmentType: 'Full-time',
      manager: 'Rohan Mehta',
      location: 'Bengaluru',
      joinDate: new Date().toISOString().split('T')[0],
      basicSalary: 65000,
      allowances: 25000,
      deductions: 8000,
      status: 'Active',
      role: 'employee',
    });
  };

  const handleOpenAddModal = () => {
    resetForm();
    setAddModalOpen(true);
  };

  const handleOpenEditModal = (emp: Employee) => {
    setSelectedEmployee(emp);
    setFormData({
      firstName: emp.firstName || emp.name.split(' ')[0] || '',
      lastName: emp.lastName || emp.name.split(' ')[1] || '',
      email: emp.email,
      phone: emp.phone || '',
      employeeId: emp.employeeId,
      department: emp.department,
      jobTitle: emp.jobTitle,
      employmentType: (emp.employmentType as any) || 'Full-time',
      manager: emp.manager || 'Rohan Mehta',
      location: emp.location || 'Bengaluru',
      joinDate: emp.joinDate || new Date().toISOString().split('T')[0],
      basicSalary: emp.basicSalary || 65000,
      allowances: emp.allowances || 25000,
      deductions: emp.deductions || 8000,
      status: emp.status,
      role: emp.role || 'employee',
    });
    setEditModalOpen(true);
  };

  const handleSaveAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.employeeId) {
      toast.error('Please fill in all required fields.');
      return;
    }
    try {
      const netSalary = formData.basicSalary + formData.allowances - formData.deductions;
      await employeeService.createEmployee({
        ...formData,
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        attendanceRate: 100,
        leaveBalance: 24,
        netSalary,
      });
      toast.success('Employee created successfully!');
      setAddModalOpen(false);
      loadData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error creating employee');
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployee) return;
    try {
      const netSalary = formData.basicSalary + formData.allowances - formData.deductions;
      await employeeService.updateEmployee(selectedEmployee.id, {
        ...formData,
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        netSalary,
      });
      toast.success('Employee updated successfully!');
      setEditModalOpen(false);
      loadData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error updating employee');
    }
  };

  const handleToggleStatus = async (emp: Employee) => {
    try {
      await employeeService.toggleEmployeeStatus(emp.id);
      toast.success(`Status for ${emp.name} updated.`);
      loadData();
    } catch (e) {
      toast.error('Failed updating status');
    }
  };

  const handleDelete = async (emp: Employee) => {
    if (window.confirm(`Are you sure you want to delete ${emp.name}?`)) {
      try {
        await employeeService.deleteEmployee(emp.id);
        toast.success(`Employee ${emp.name} deleted.`);
        loadData();
      } catch (e) {
        toast.error('Failed deleting employee');
      }
    }
  };

  const handleToggleWfhException = async (emp: Employee) => {
    try {
      const nextState = !emp.wfhExceptionActive;
      await employeeService.updateWorkMode(emp.id, emp.workMode || 'Office', nextState);
      setEmployees(prev => prev.map(e => e.id === emp.id ? { ...e, wfhExceptionActive: nextState } : e));
      toast.success(`WFH Exception for ${emp.name} set to ${nextState ? 'ACTIVE' : 'INACTIVE'}`);
    } catch (err) {
      toast.error('Failed to update WFH exception');
    }
  };

  // --- CSV FILE IMPORT IMPLEMENTATION ---
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.data.length === 0) {
          toast.error('No data found in spreadsheet.');
          return;
        }
        setParsedData(results.data);
        setParsedHeaders(results.meta.fields || []);
        
        // Auto-match headers to Dayflow properties
        const autoMapping: Record<string, string> = {};
        const fields = [
          'employeeId', 'firstName', 'lastName', 'email', 'phone', 
          'dateOfBirth', 'gender', 'address', 'department', 'jobTitle', 
          'employmentType', 'joiningDate', 'manager', 'location', 
          'basicSalary', 'allowances', 'deductions'
        ];

        results.meta.fields?.forEach(header => {
          const cleanHeader = header.toLowerCase().replace(/[^a-z0-9]/g, '');
          const match = fields.find(field => {
            const cleanField = field.toLowerCase();
            return cleanField === cleanHeader || cleanField.includes(cleanHeader) || cleanHeader.includes(cleanField);
          });
          if (match) {
            autoMapping[header] = match;
          }
        });

        setColumnMapping(autoMapping);
        setImportStep(2);
      },
      error: () => {
        toast.error('Error parsing CSV file.');
      }
    });
  };

  const handleRunValidation = () => {
    // Validate each row
    const valid: any[] = [];
    const invalid: any[] = [];
    const duplicates: any[] = [];

    parsedData.forEach((row, idx) => {
      const rowNum = idx + 1;
      const errors: string[] = [];
      
      const employeeId = row[Object.keys(columnMapping).find(k => columnMapping[k] === 'employeeId') || ''];
      const firstName = row[Object.keys(columnMapping).find(k => columnMapping[k] === 'firstName') || ''];
      const email = row[Object.keys(columnMapping).find(k => columnMapping[k] === 'email') || ''];
      const department = row[Object.keys(columnMapping).find(k => columnMapping[k] === 'department') || ''];

      if (!employeeId) errors.push('Employee ID is missing.');
      if (!firstName) errors.push('First name is missing.');
      if (!email) {
        errors.push('Email is missing.');
      } else if (!/\S+@\S+\.\S+/.test(email)) {
        errors.push('Invalid email address format.');
      }
      if (!department) errors.push('Department is missing.');

      const mappedRow: any = {};
      Object.entries(columnMapping).forEach(([header, field]) => {
        mappedRow[field] = row[header];
      });

      // Check duplicate against existing DB array
      const isDuplicate = employees.some(
        e => e.employeeId.toLowerCase() === (employeeId || '').toLowerCase() || 
             e.email.toLowerCase() === (email || '').toLowerCase()
      );

      if (errors.length > 0) {
        invalid.push({ row: rowNum, errors, data: mappedRow });
      } else if (isDuplicate) {
        duplicates.push({ row: rowNum, errors: ['Employee ID or Email already exists.'], data: mappedRow });
      } else {
        valid.push(mappedRow);
      }
    });

    setValidationResult({ valid, invalid, duplicates });
    setImportStep(3);
  };

  const handleConfirmImport = async () => {
    setLoading(true);
    let imported = 0;
    let skipped = 0;
    let failed = 0;

    // Handle duplicates
    const recordsToProcess = [...validationResult.valid];
    if (duplicateAction === 'Update') {
      validationResult.duplicates.forEach(d => recordsToProcess.push(d.data));
    } else {
      skipped += validationResult.duplicates.length;
    }

    failed += validationResult.invalid.length;

    for (const record of recordsToProcess) {
      try {
        const checkExisting = employees.find(
          e => e.employeeId.toLowerCase() === record.employeeId.toLowerCase() ||
               e.email.toLowerCase() === record.email.toLowerCase()
        );

        if (checkExisting && duplicateAction === 'Update') {
          await employeeService.updateEmployee(checkExisting.id, {
            firstName: record.firstName,
            lastName: record.lastName || '',
            email: record.email,
            phone: record.phone || '',
            jobTitle: record.jobTitle || 'Staff',
            department: record.department,
            basicSalary: Number(record.basicSalary || 0),
            allowances: Number(record.allowances || 0),
            deductions: Number(record.deductions || 0),
          });
        } else {
          await employeeService.createEmployee({
            employeeId: record.employeeId,
            firstName: record.firstName,
            lastName: record.lastName || '',
            name: `${record.firstName} ${record.lastName || ''}`.trim(),
            email: record.email,
            phone: record.phone || '',
            dateOfBirth: record.dateOfBirth,
            gender: record.gender,
            address: record.address,
            department: record.department,
            jobTitle: record.jobTitle || 'Staff',
            employmentType: record.employmentType || 'Full-time',
            joinDate: record.joiningDate || new Date().toISOString().split('T')[0],
            location: record.location || 'Bengaluru',
            status: 'Active',
            basicSalary: Number(record.basicSalary || 0),
            allowances: Number(record.allowances || 0),
            deductions: Number(record.deductions || 0),
            netSalary: Number(record.basicSalary || 0) + Number(record.allowances || 0) - Number(record.deductions || 0),
            attendanceRate: 100,
            leaveBalance: 18,
            role: 'employee',
          });
        }
        imported++;
      } catch (err) {
        failed++;
      }
    }

    setImportSummary({ success: imported, skipped, failed });
    setImportStep(4);
    loadData();
  };

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Employee Directory</h2>
          <p className="text-xs text-slate-600 mt-0.5">Manage workforce records, roles, and profiles</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={() => setImportModalOpen(true)} leftIcon={<Upload className="w-4 h-4" />}>
            Import Employees
          </Button>
          <Button onClick={handleOpenAddModal} leftIcon={<UserPlus className="w-4 h-4" />}>
            Add New Employee
          </Button>
        </div>
      </div>

      {/* Main Employee Table Card */}
      <Card padding="none">
        {/* Controls Bar */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 w-4 h-4" />
            <input
              type="text"
              placeholder="Search employee, ID, dept..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
              <Filter className="w-3.5 h-3.5" /> Department:
            </div>
            <select
              value={deptFilter}
              onChange={e => { setDeptFilter(e.target.value); setPage(1); }}
              className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {DEPARTMENTS.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>

            <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium ml-2">
              Status:
            </div>
            <select
              value={statusFilter}
              onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
              className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {STATUSES.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-slate-600 uppercase tracking-wider text-[11px] font-semibold">
                <th className="text-left px-4 py-3">Employee</th>
                <th className="text-left px-3 py-3">Emp ID</th>
                <th className="text-left px-3 py-3 hidden sm:table-cell">Department</th>
                <th className="text-left px-3 py-3 hidden md:table-cell">Work Mode / Exception</th>
                <th className="text-left px-3 py-3">Status</th>
                <th className="text-left px-3 py-3 hidden lg:table-cell">Joining Date</th>
                <th className="text-right px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-600">Loading employees...</td>
                </tr>
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-600">
                    No employees found. click "Add Employee" or "Import Employees" to seed workforce.
                  </td>
                </tr>
              ) : (
                paginated.map(emp => (
                  <tr key={emp.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar name={emp.name} size="sm" />
                        <div>
                          <p className="font-semibold text-slate-900">{emp.name}</p>
                          <p className="text-[11px] text-slate-600">{emp.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3 font-mono text-slate-600 font-medium">{emp.employeeId}</td>
                    <td className="px-3 py-3 hidden sm:table-cell text-slate-700">{emp.department}</td>
                    <td className="px-3 py-3 hidden md:table-cell">
                      <div className="flex items-center gap-1.5">
                        <span className={`px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                          emp.workMode === 'Remote' ? 'bg-purple-50 text-purple-700 border border-purple-200' :
                          emp.workMode === 'Hybrid' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                          'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}>
                          {emp.workMode || 'Office'}
                        </span>
                        {emp.wfhExceptionActive && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                            WFH Exception
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-3"><StatusBadge status={emp.status} /></td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleToggleWfhException(emp)}
                          title={emp.wfhExceptionActive ? 'Revoke WFH Exception' : 'Grant WFH Exception'}
                          className={`px-2 py-1 rounded text-[10px] font-bold transition-colors ${
                            emp.wfhExceptionActive
                              ? 'bg-amber-500 text-white hover:bg-amber-600'
                              : 'bg-slate-100 text-slate-600 hover:bg-amber-100 hover:text-amber-700'
                          }`}
                        >
                          {emp.wfhExceptionActive ? 'WFH Active' : '+ WFH Exemption'}
                        </button>
                        <button
                          onClick={() => { setSelectedEmployee(emp); setViewDetailModalOpen(true); }}
                          title="View Details"
                          className="p-1.5 rounded-md hover:bg-indigo-50 text-slate-600 hover:text-indigo-600"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenEditModal(emp)}
                          title="Edit"
                          className="p-1.5 rounded-md hover:bg-blue-50 text-slate-600 hover:text-blue-600"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(emp)}
                          title={emp.status === 'Active' ? 'Deactivate' : 'Activate'}
                          className={`p-1.5 rounded-md hover:bg-amber-50 ${emp.status === 'Active' ? 'text-amber-600' : 'text-emerald-600'}`}
                        >
                          <Power className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(emp)}
                          title="Delete"
                          className="p-1.5 rounded-md hover:bg-red-50 text-slate-600 hover:text-red-600"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span>Showing {paginated.length} of {filtered.length} employees</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1 rounded hover:bg-slate-100 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span>Page {page} of {totalPages}</span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1 rounded hover:bg-slate-100 disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </Card>

      {/* --- ADD / EDIT MODALS REMAIN IDENTICAL AND STABLE --- */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 animate-fade-in">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Add New Employee</h3>
              <button onClick={() => setAddModalOpen(false)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAdd} className="space-y-4 mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="First Name *"
                  value={formData.firstName}
                  onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                  required
                />
                <Input
                  label="Last Name *"
                  value={formData.lastName}
                  onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                  required
                />
                <Input
                  label="Email *"
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  required
                />
                <Input
                  label="Phone Number"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                />
                <Input
                  label="Employee ID *"
                  value={formData.employeeId}
                  onChange={e => setFormData({ ...formData, employeeId: e.target.value })}
                  required
                />
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Department</label>
                  <select
                    value={formData.department}
                    onChange={e => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white"
                  >
                    {DEPARTMENTS.filter(d => d !== 'All').map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <Input
                  label="Job Title"
                  value={formData.jobTitle}
                  onChange={e => setFormData({ ...formData, jobTitle: e.target.value })}
                />
                <Input
                  label="Joining Date"
                  type="date"
                  value={formData.joinDate}
                  onChange={e => setFormData({ ...formData, joinDate: e.target.value })}
                />
                <Input
                  label="Basic Salary (₹/mo)"
                  type="number"
                  value={formData.basicSalary}
                  onChange={e => setFormData({ ...formData, basicSalary: Number(e.target.value) })}
                />
                <Input
                  label="Allowances (₹/mo)"
                  type="number"
                  value={formData.allowances}
                  onChange={e => setFormData({ ...formData, allowances: Number(e.target.value) })}
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <Button variant="ghost" type="button" onClick={() => setAddModalOpen(false)}>Cancel</Button>
                <Button type="submit">Create Employee</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 animate-fade-in">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Edit Employee Details</h3>
              <button onClick={() => setEditModalOpen(false)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="First Name"
                  value={formData.firstName}
                  onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                />
                <Input
                  label="Last Name"
                  value={formData.lastName}
                  onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                />
                <Input
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                />
                <Input
                  label="Phone"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                />
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Department</label>
                  <select
                    value={formData.department}
                    onChange={e => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white"
                  >
                    {DEPARTMENTS.filter(d => d !== 'All').map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <Input
                  label="Job Title"
                  value={formData.jobTitle}
                  onChange={e => setFormData({ ...formData, jobTitle: e.target.value })}
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <Button variant="ghost" type="button" onClick={() => setEditModalOpen(false)}>Cancel</Button>
                <Button type="submit">Save Changes</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Detail Modal */}
      {viewDetailModalOpen && selectedEmployee && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 animate-fade-in">
            <div className="flex items-start justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-4">
                <Avatar name={selectedEmployee.name} size="xl" />
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{selectedEmployee.name}</h3>
                  <p className="text-xs text-slate-600">{selectedEmployee.jobTitle} · {selectedEmployee.department}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <Badge variant="purple">{selectedEmployee.employeeId}</Badge>
                    <StatusBadge status={selectedEmployee.status} />
                  </div>
                </div>
              </div>
              <button onClick={() => setViewDetailModalOpen(false)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <UserIcon className="w-3.5 h-3.5 text-indigo-600" /> Personal & Contact Info
                </h4>
                <div className="text-xs space-y-1.5 text-slate-600">
                  <p><strong>Email:</strong> {selectedEmployee.email}</p>
                  <p><strong>Phone:</strong> {selectedEmployee.phone || '+91 98765 43210'}</p>
                  <p><strong>Date of Birth:</strong> {selectedEmployee.dateOfBirth || '—'}</p>
                  <p><strong>Gender:</strong> {selectedEmployee.gender || '—'}</p>
                  <p><strong>Address:</strong> {selectedEmployee.address || '—'}</p>
                </div>
              </div>

              <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-indigo-600" /> Employment Details
                </h4>
                <div className="text-xs space-y-1.5 text-slate-600">
                  <p><strong>Department:</strong> {selectedEmployee.department}</p>
                  <p><strong>Role Title:</strong> {selectedEmployee.jobTitle}</p>
                  <p><strong>Employment Type:</strong> {selectedEmployee.employmentType || 'Full-time'}</p>
                  <p><strong>Joining Date:</strong> {selectedEmployee.joinDate}</p>
                  <p><strong>Reporting Manager:</strong> {selectedEmployee.manager || 'Rohan Mehta'}</p>
                </div>
              </div>

              <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-600" /> Salary Structure
                </h4>
                <div className="text-xs space-y-1.5 text-slate-600">
                  <p><strong>Basic Salary:</strong> ₹{(selectedEmployee.basicSalary || 0).toLocaleString()}/mo</p>
                  <p><strong>Allowances:</strong> ₹{(selectedEmployee.allowances || 0).toLocaleString()}/mo</p>
                  <p><strong>Deductions:</strong> ₹{(selectedEmployee.deductions || 0).toLocaleString()}/mo</p>
                  <p className="text-emerald-700 font-bold pt-1 border-t border-slate-200">
                    Net Take Home: ₹{(selectedEmployee.netSalary || 0).toLocaleString()}/mo
                  </p>
                </div>
              </div>

              <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-indigo-600" /> Documents & Summary
                </h4>
                <div className="text-xs space-y-2 text-slate-600">
                  <p><strong>Attendance Rate:</strong> {selectedEmployee.attendanceRate}%</p>
                  <p><strong>Leave Balance:</strong> {selectedEmployee.leaveBalance} days</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- MULTI-STEP BULK EMPLOYEE IMPORT WIZARD MODAL --- */}
      {importModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 animate-fade-in text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Spreadsheet Importer</h3>
                <p className="text-[11px] text-slate-600 mt-0.5">Bulk register company employees via CSV uploads</p>
              </div>
              <button onClick={() => { setImportModalOpen(false); setImportStep(1); }} className="p-1 text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Step Content */}
            {importStep === 1 && (
              <div className="py-6 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-xl mt-4">
                <Upload className="w-10 h-10 text-slate-600 mb-2" />
                <p className="font-semibold text-slate-700">Choose CSV File to upload</p>
                <p className="text-[11px] text-slate-600 mt-0.5 mb-4">Make sure headers match employee schema attributes</p>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="csv-file-upload"
                />
                <Button onClick={() => document.getElementById('csv-file-upload')?.click()}>
                  Browse File
                </Button>
              </div>
            )}

            {importStep === 2 && (
              <div className="py-4 space-y-4">
                <div className="bg-slate-50 p-3 rounded-xl">
                  <p className="font-semibold text-slate-800">Column Alignment mapping</p>
                  <p className="text-[11px] text-slate-600 mt-0.5">Map your spreadsheet columns to Dayflow Fields</p>
                </div>

                <div className="max-h-60 overflow-y-auto space-y-2.5">
                  {parsedHeaders.map(header => (
                    <div key={header} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                      <span className="font-mono text-slate-700">{header}</span>
                      <div className="flex items-center gap-1.5">
                        <span>➔</span>
                        <select
                          value={columnMapping[header] || ''}
                          onChange={e => setColumnMapping({ ...columnMapping, [header]: e.target.value })}
                          className="px-2.5 py-1 text-xs border border-slate-200 rounded bg-white text-slate-700"
                        >
                          <option value="">Ignore Column</option>
                          <option value="employeeId">Employee ID (Code)</option>
                          <option value="firstName">First Name</option>
                          <option value="lastName">Last Name</option>
                          <option value="email">Email</option>
                          <option value="phone">Phone</option>
                          <option value="department">Department</option>
                          <option value="jobTitle">Job Title</option>
                          <option value="basicSalary">Basic Salary</option>
                          <option value="allowances">Allowances</option>
                          <option value="deductions">Deductions</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                  <Button variant="ghost" onClick={() => setImportStep(1)}>Back</Button>
                  <Button onClick={handleRunValidation}>Validate Records</Button>
                </div>
              </div>
            )}

            {importStep === 3 && (
              <div className="py-4 space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100 text-center">
                    <p className="text-[10px] text-emerald-600 font-semibold uppercase">Valid Rows</p>
                    <p className="text-xl font-bold text-emerald-800 mt-1">{validationResult.valid.length}</p>
                  </div>
                  <div className="bg-amber-50 p-3 rounded-xl border border-amber-100 text-center">
                    <p className="text-[10px] text-amber-600 font-semibold uppercase">Duplicates</p>
                    <p className="text-xl font-bold text-amber-800 mt-1">{validationResult.duplicates.length}</p>
                  </div>
                  <div className="bg-red-50 p-3 rounded-xl border border-red-100 text-center">
                    <p className="text-[10px] text-red-600 font-semibold uppercase">Invalid Rows</p>
                    <p className="text-xl font-bold text-red-800 mt-1">{validationResult.invalid.length}</p>
                  </div>
                </div>

                {/* Duplicates Rule Choice */}
                {validationResult.duplicates.length > 0 && (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-slate-800">Duplicate Handling</p>
                      <p className="text-[10px] text-slate-600">Choose how duplicates should be handled</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setDuplicateAction('Skip')}
                        className={`px-3 py-1 rounded-lg border text-xs font-semibold ${duplicateAction === 'Skip' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-slate-200 text-slate-600'}`}
                      >
                        Skip
                      </button>
                      <button
                        onClick={() => setDuplicateAction('Update')}
                        className={`px-3 py-1 rounded-lg border text-xs font-semibold ${duplicateAction === 'Update' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-slate-200 text-slate-600'}`}
                      >
                        Update
                      </button>
                    </div>
                  </div>
                )}

                {/* Detailed Validation Log List */}
                <div className="max-h-40 overflow-y-auto space-y-2">
                  {validationResult.invalid.map((inv, idx) => (
                    <div key={idx} className="p-2 border border-red-100 bg-red-50/50 rounded-lg flex items-start gap-2">
                      <AlertTriangle className="w-3.5 h-3.5 text-red-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-red-800">Row {inv.row} (Parsing Error):</p>
                        <p className="text-red-700 font-medium">{inv.errors.join(' ')}</p>
                      </div>
                    </div>
                  ))}
                  {validationResult.valid.map((val, idx) => (
                    <div key={idx} className="p-2 border border-slate-100 bg-slate-50/50 rounded-lg text-slate-600">
                      Row {idx + 1}: Valid employee record: <strong>{val.firstName}</strong> ({val.email})
                    </div>
                  ))}
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                  <Button variant="ghost" onClick={() => setImportStep(2)}>Back</Button>
                  <Button onClick={handleConfirmImport} disabled={validationResult.valid.length === 0 && duplicateAction === 'Skip'}>
                    Confirm Import
                  </Button>
                </div>
              </div>
            )}

            {importStep === 4 && (
              <div className="py-6 text-center space-y-4">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
                <div>
                  <h4 className="text-base font-bold text-slate-900">Bulk Import Finished!</h4>
                  <p className="text-[11px] text-slate-600 mt-0.5">Spreadsheet records processed securely</p>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 max-w-sm mx-auto grid grid-cols-3 gap-2">
                  <div>
                    <p className="font-bold text-slate-800 text-lg">{importSummary.success}</p>
                    <p className="text-[10px] text-slate-600 uppercase font-semibold">Imported</p>
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 text-lg">{importSummary.skipped}</p>
                    <p className="text-[10px] text-slate-600 uppercase font-semibold">Skipped</p>
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 text-lg">{importSummary.failed}</p>
                    <p className="text-[10px] text-slate-600 uppercase font-semibold">Failed</p>
                  </div>
                </div>

                <Button onClick={() => { setImportModalOpen(false); setImportStep(1); }}>
                  Finish Importer
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
