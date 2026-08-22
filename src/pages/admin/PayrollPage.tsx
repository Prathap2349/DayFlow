// src/pages/admin/PayrollPage.tsx
import { useState, useEffect } from 'react';
import { DollarSign, Edit, Search, X } from 'lucide-react';
import { Card, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Avatar } from '../../components/ui/Avatar';
import { StatCard } from '../../components/shared/StatCard';
import { employeeService } from '../../services/employeeService';
import { payrollService } from '../../services/payrollService';
import type { Employee } from '../../types/employee';
import toast from 'react-hot-toast';

export function AdminPayrollPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [search, setSearch] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEmp, setSelectedEmp] = useState<Employee | null>(null);
  const [basicSalary, setBasicSalary] = useState(65000);
  const [allowances, setAllowances] = useState(25000);
  const [deductions, setDeductions] = useState(8000);

  const loadData = async () => {
    const list = await employeeService.getEmployees();
    setEmployees(list);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenEdit = (emp: Employee) => {
    setSelectedEmp(emp);
    setBasicSalary(emp.basicSalary || 65000);
    setAllowances(emp.allowances || 25000);
    setDeductions(emp.deductions || 8000);
    setModalOpen(true);
  };

  const handleSaveSalary = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmp) return;
    try {
      await payrollService.updateSalaryStructure(selectedEmp.employeeId, {
        basicSalary,
        allowances,
        deductions,
      });
      toast.success(`Salary updated for ${selectedEmp.name}!`);
      setModalOpen(false);
      loadData();
    } catch (err) {
      toast.error('Failed updating salary structure.');
    }
  };

  const totalPayroll = employees.reduce((sum, e) => sum + (e.netSalary || 82000), 0);
  const avgSalary = employees.length > 0 ? Math.round(totalPayroll / employees.length) : 0;

  const filtered = employees.filter(
    e =>
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.employeeId.toLowerCase().includes(search.toLowerCase()) ||
      e.department.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Workforce Payroll Management</h2>
          <p className="text-xs text-slate-500 mt-0.5">Manage salary structures, allowances, and monthly payrolls</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Total Monthly Payroll"
          value={`₹${totalPayroll.toLocaleString()}`}
          subtext={`Across ${employees.length} employees`}
          icon={<DollarSign className="w-5 h-5" />}
          iconBg="bg-emerald-50 text-emerald-600"
        />
        <StatCard
          label="Average Salary"
          value={`₹${avgSalary.toLocaleString()}`}
          subtext="Per employee / month"
          icon={<DollarSign className="w-5 h-5" />}
          iconBg="bg-indigo-50 text-indigo-600"
        />
        <StatCard
          label="Pending Pay Adjustments"
          value="0 employees"
          subtext="All structures aligned"
          icon={<DollarSign className="w-5 h-5" />}
          iconBg="bg-blue-50 text-blue-600"
        />
      </div>

      <Card padding="none">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <CardHeader title="Employee Salary Directory" subtitle="Manage individual salary packages" />
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search employee, dept..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-slate-500 uppercase tracking-wider text-[11px] font-semibold">
                <th className="text-left px-5 py-3">Employee</th>
                <th className="text-left px-4 py-3">Department</th>
                <th className="text-left px-4 py-3">Basic Pay</th>
                <th className="text-left px-4 py-3">Allowances</th>
                <th className="text-left px-4 py-3">Deductions</th>
                <th className="text-left px-4 py-3">Net Take-Home</th>
                <th className="text-right px-5 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(emp => {
                const basic = emp.basicSalary || 65000;
                const allow = emp.allowances || 25000;
                const ded = emp.deductions || 8000;
                const net = basic + allow - ded;
                return (
                  <tr key={emp.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <Avatar name={emp.name} size="sm" />
                        <div>
                          <p className="font-semibold text-slate-900">{emp.name}</p>
                          <p className="text-[11px] text-slate-400">{emp.employeeId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-slate-600">{emp.department}</td>
                    <td className="px-4 py-3.5 text-slate-700">₹{basic.toLocaleString()}</td>
                    <td className="px-4 py-3.5 text-slate-700">₹{allow.toLocaleString()}</td>
                    <td className="px-4 py-3.5 text-red-600">-₹{ded.toLocaleString()}</td>
                    <td className="px-4 py-3.5 font-bold text-emerald-700">₹{net.toLocaleString()}</td>
                    <td className="px-5 py-3.5 text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        leftIcon={<Edit className="w-3.5 h-3.5" />}
                        onClick={() => handleOpenEdit(emp)}
                      >
                        Edit Package
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {modalOpen && selectedEmp && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-md p-6 animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Update Salary Package</h3>
              <button onClick={() => setModalOpen(false)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSalary} className="space-y-4 mt-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl">
                <p className="font-bold text-slate-900">{selectedEmp.name}</p>
                <p className="text-slate-500">{selectedEmp.jobTitle} · {selectedEmp.employeeId}</p>
              </div>

              <Input
                label="Basic Salary (₹/month) *"
                type="number"
                value={basicSalary}
                onChange={e => setBasicSalary(Number(e.target.value))}
                required
              />

              <Input
                label="Allowances (HRA, Medical, Special) *"
                type="number"
                value={allowances}
                onChange={e => setAllowances(Number(e.target.value))}
                required
              />

              <Input
                label="Total Deductions (PF, Taxes) *"
                type="number"
                value={deductions}
                onChange={e => setDeductions(Number(e.target.value))}
                required
              />

              <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl font-bold flex items-center justify-between text-xs">
                <span>Calculated Net Salary:</span>
                <span className="text-sm">₹{(basicSalary + allowances - deductions).toLocaleString()}/mo</span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <Button variant="ghost" type="button" onClick={() => setModalOpen(false)}>Cancel</Button>
                <Button type="submit">Save Salary Package</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
