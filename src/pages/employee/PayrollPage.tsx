// src/pages/employee/PayrollPage.tsx
import { useState, useEffect } from 'react';
import { Download, Eye, X, Building } from 'lucide-react';
import { Card, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { useAuth } from '../../auth/useAuth';
import { payrollService } from '../../services/payrollService';
import { generatePayslipPDF } from '../../utils/pdfGenerator';
import type { Payslip, SalaryStructure } from '../../types/payroll';
import toast from 'react-hot-toast';

export function EmployeePayrollPage() {
  const { user } = useAuth();
  const [payslips, setPayslips] = useState<Payslip[]>([]);
  const [salaryStructure, setSalaryStructure] = useState<SalaryStructure | null>(null);
  const [selectedPayslip, setSelectedPayslip] = useState<Payslip | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const empId = user?.employeeId || user?.id || '';

  useEffect(() => {
    if (!empId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    Promise.all([
      payrollService.getEmployeePayslips(empId),
      payrollService.getSalaryStructure(empId),
    ])
      .then(([slips, structure]) => {
        setPayslips(slips);
        setSalaryStructure(structure);
      })
      .catch(() => {
        toast.error('Failed loading payroll records');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [user, empId]);

  const handleDownload = (slip: Payslip) => {
    try {
      generatePayslipPDF(slip);
      toast.success(`Payslip for ${slip.month} downloaded.`);
    } catch (e) {
      toast.error('Failed to generate PDF payslip.');
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-400">Loading salary details...</div>;
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Salary & Payslips</h2>
        <p className="text-xs text-slate-500 mt-0.5">View your monthly salary breakdown and download payslips</p>
      </div>

      {/* Salary Breakdown Summary Card */}
      {salaryStructure ? (
        <Card className="p-6 bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
            <div>
              <p className="text-xs text-indigo-300 uppercase tracking-wider font-semibold">Net Take-Home Salary</p>
              <h3 className="text-3xl font-extrabold text-emerald-400 mt-1">
                ₹{salaryStructure.netSalary.toLocaleString()} <span className="text-xs font-normal text-slate-300">/ month</span>
              </h3>
            </div>
            <Badge variant="success" className="w-fit">Employee Access</Badge>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 text-xs">
            <div>
              <p className="text-slate-400">Basic Pay</p>
              <p className="font-semibold text-white mt-0.5">₹{salaryStructure.basicSalary.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-slate-400">HRA & Special</p>
              <p className="font-semibold text-white mt-0.5">₹{(salaryStructure.hra + salaryStructure.specialAllowance).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-slate-400">Total Deductions</p>
              <p className="font-semibold text-red-300 mt-0.5">-₹{(salaryStructure.providentFund + salaryStructure.incomeTax).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-slate-400">Currency</p>
              <p className="font-semibold text-white mt-0.5">{salaryStructure.currency}</p>
            </div>
          </div>
        </Card>
      ) : (
        <Card className="p-6 text-center text-slate-400 text-xs">
          No salary structure has been assigned to your employee account yet. Contact HR.
        </Card>
      )}

      {/* Payslips Table */}
      <Card padding="none">
        <div className="px-5 py-4 border-b border-slate-100">
          <CardHeader title="Salary Slip History" subtitle="Official monthly pay statements" />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-slate-500 uppercase tracking-wider text-[11px] font-semibold">
                <th className="text-left px-5 py-3">Pay Period</th>
                <th className="text-left px-4 py-3">Payment Date</th>
                <th className="text-left px-4 py-3">Gross Salary</th>
                <th className="text-left px-4 py-3">Deductions</th>
                <th className="text-left px-4 py-3">Net Paid</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-right px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {payslips.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">No payslips available.</td>
                </tr>
              ) : (
                payslips.map(slip => (
                  <tr key={slip.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-3.5 font-bold text-slate-900">{slip.month}</td>
                    <td className="px-4 py-3.5 text-slate-600">{slip.paymentDate}</td>
                    <td className="px-4 py-3.5 text-slate-700">₹{(slip.basicSalary + slip.allowances).toLocaleString()}</td>
                    <td className="px-4 py-3.5 text-red-600">-₹{slip.deductions.toLocaleString()}</td>
                    <td className="px-4 py-3.5 font-bold text-emerald-700">₹{slip.netSalary.toLocaleString()}</td>
                    <td className="px-4 py-3.5"><Badge variant="success" dot>{slip.status}</Badge></td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          leftIcon={<Eye className="w-3.5 h-3.5" />}
                          onClick={() => { setSelectedPayslip(slip); setModalOpen(true); }}
                        >
                          View Slip
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          leftIcon={<Download className="w-3.5 h-3.5" />}
                          onClick={() => handleDownload(slip)}
                        >
                          Download
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* View Payslip Modal */}
      {modalOpen && selectedPayslip && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-2xl p-6 animate-fade-in">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Building className="w-5 h-5 text-indigo-600" />
                <div>
                  <h3 className="text-base font-bold text-slate-900">Dayflow Technologies</h3>
                  <p className="text-xs text-slate-400">Official Payslip Statement — {selectedPayslip.month}</p>
                </div>
              </div>
              <button onClick={() => setModalOpen(false)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3 rounded-xl">
                <div>
                  <p className="text-slate-500">Employee Name</p>
                  <p className="font-semibold text-slate-900">{selectedPayslip.employeeName}</p>
                </div>
                <div>
                  <p className="text-slate-500">Employee ID</p>
                  <p className="font-mono font-semibold text-slate-900">{selectedPayslip.employeeId}</p>
                </div>
                <div>
                  <p className="text-slate-500">Pay Period</p>
                  <p className="font-semibold text-slate-900">{selectedPayslip.payPeriod}</p>
                </div>
                <div>
                  <p className="text-slate-500">Payment Date</p>
                  <p className="font-semibold text-slate-900">{selectedPayslip.paymentDate}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 pt-2">
                <div>
                  <h4 className="font-bold text-slate-800 pb-2 border-b border-slate-100">Earnings</h4>
                  <div className="space-y-1.5 pt-2 text-slate-600">
                    <div className="flex justify-between"><span>Basic Salary</span><span>₹{selectedPayslip.basicSalary.toLocaleString()}</span></div>
                    <div className="flex justify-between"><span>HRA & Special Allowances</span><span>₹{selectedPayslip.allowances.toLocaleString()}</span></div>
                    <div className="flex justify-between font-bold text-slate-900 pt-2 border-t border-slate-100">
                      <span>Total Earnings</span><span>₹{(selectedPayslip.basicSalary + selectedPayslip.allowances).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-slate-800 pb-2 border-b border-slate-100">Deductions</h4>
                  <div className="space-y-1.5 pt-2 text-slate-600">
                    <div className="flex justify-between"><span>Provident Fund (PF)</span><span>₹{Math.round(selectedPayslip.deductions * 0.6).toLocaleString()}</span></div>
                    <div className="flex justify-between"><span>Income Tax & PT</span><span>₹{Math.round(selectedPayslip.deductions * 0.4).toLocaleString()}</span></div>
                    <div className="flex justify-between font-bold text-red-600 pt-2 border-t border-slate-100">
                      <span>Total Deductions</span><span>-₹{selectedPayslip.deductions.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-emerald-50 text-emerald-900 rounded-xl font-bold flex items-center justify-between text-sm">
                <span>Net Payable Amount</span>
                <span className="text-lg text-emerald-700">₹{selectedPayslip.netSalary.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
              <Button variant="ghost" onClick={() => setModalOpen(false)}>Close</Button>
              <Button leftIcon={<Download className="w-4 h-4" />} onClick={() => handleDownload(selectedPayslip)}>
                Download PDF
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
