// src/utils/pdfGenerator.ts
import { jsPDF } from 'jspdf';
import type { Payslip } from '../types/payroll';

export const generatePayslipPDF = (slip: Payslip) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const primaryColor = '#4F46E5';
  const textColor = '#0F172A';
  const grayColor = '#64748B';

  // --- Document Header ---
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(primaryColor);
  doc.text('DAYFLOW TECHNOLOGIES', 20, 25);

  doc.setFontSize(8);
  doc.setTextColor(grayColor);
  doc.setFont('Helvetica', 'normal');
  doc.text('Every workday, perfectly aligned.', 20, 30);

  doc.setFontSize(14);
  doc.setTextColor(textColor);
  doc.setFont('Helvetica', 'bold');
  doc.text('OFFICIAL PAYSLIP STATEMENT', 130, 25);

  // Divider
  doc.setDrawColor('#E2E8F0');
  doc.setLineWidth(0.5);
  doc.line(20, 35, 190, 35);

  // --- Employee Details Box ---
  doc.setFontSize(10);
  doc.setFont('Helvetica', 'bold');
  doc.text('EMPLOYEE DETAILS', 20, 45);

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(grayColor);
  doc.text('Name:', 20, 52);
  doc.text('Employee ID:', 20, 58);
  doc.text('Pay Period:', 20, 64);

  doc.setTextColor(textColor);
  doc.setFont('Helvetica', 'bold');
  doc.text(slip.employeeName, 50, 52);
  doc.text(slip.employeeId, 50, 58);
  doc.text(slip.payPeriod, 50, 64);

  doc.setTextColor(grayColor);
  doc.setFont('Helvetica', 'normal');
  doc.text('Statement Month:', 120, 52);
  doc.text('Payment Date:', 120, 58);
  doc.text('Payment Status:', 120, 64);

  doc.setTextColor(textColor);
  doc.setFont('Helvetica', 'bold');
  doc.text(slip.month, 150, 52);
  doc.text(slip.paymentDate, 150, 58);
  doc.text(slip.status, 150, 64);

  // --- Income & Deduction Columns ---
  // Table Box Border
  doc.rect(20, 75, 82, 65);
  doc.rect(108, 75, 82, 65);

  // Column Headers
  doc.setFillColor('#F8FAFC');
  doc.rect(20.25, 75.25, 81.5, 8, 'F');
  doc.rect(108.25, 75.25, 81.5, 8, 'F');

  doc.setFontSize(9);
  doc.setFont('Helvetica', 'bold');
  doc.text('EARNINGS / INCOMES', 24, 80.5);
  doc.text('AMOUNT', 80, 80.5);

  doc.text('DEDUCTIONS', 112, 80.5);
  doc.text('AMOUNT', 168, 80.5);

  // Earnings Rows
  doc.setFont('Helvetica', 'normal');
  doc.setTextColor(textColor);
  doc.text('Basic Salary', 24, 92);
  doc.text(`₹${slip.basicSalary.toLocaleString()}`, 80, 92);

  const hra = Math.round(slip.basicSalary * 0.4);
  const specialAllowance = slip.allowances - hra;

  doc.text('HRA', 24, 99);
  doc.text(`₹${hra.toLocaleString()}`, 80, 99);

  doc.text('Special Allowance', 24, 106);
  doc.text(`₹${specialAllowance.toLocaleString()}`, 80, 106);

  doc.text('Other Allowances', 24, 113);
  doc.text('₹0', 80, 113);

  // Deductions Rows
  doc.text('Provident Fund (PF)', 112, 92);
  doc.text(`-₹${Math.round(slip.deductions * 0.6).toLocaleString()}`, 168, 92);

  doc.text('Income Tax (TDS)', 112, 99);
  doc.text(`-₹${Math.round(slip.deductions * 0.4).toLocaleString()}`, 168, 99);

  doc.text('Professional Tax', 112, 106);
  doc.text('₹0', 168, 106);

  // --- Totals Row ---
  doc.line(20, 125, 102, 125);
  doc.line(108, 125, 190, 125);

  doc.setFont('Helvetica', 'bold');
  doc.text('Total Earnings', 24, 131);
  doc.text(`₹${(slip.basicSalary + slip.allowances).toLocaleString()}`, 80, 131);

  doc.text('Total Deductions', 112, 131);
  doc.text(`-₹${slip.deductions.toLocaleString()}`, 168, 131);

  // --- Summary & Net Payable ---
  doc.setFillColor('#EEF2FF');
  doc.rect(20, 148, 170, 18, 'F');
  doc.setDrawColor('#C7D2FE');
  doc.rect(20, 148, 170, 18);

  doc.setFontSize(10);
  doc.setFont('Helvetica', 'bold');
  doc.setTextColor(primaryColor);
  doc.text('NET PAYABLE AMOUNT (TAKE-HOME SALARY)', 25, 159);
  doc.text(`₹${slip.netSalary.toLocaleString()}`, 155, 159);

  // Footer notes
  doc.setFontSize(7);
  doc.setTextColor(grayColor);
  doc.setFont('Helvetica', 'normal');
  doc.text('This is a computer-generated salary statement and does not require a physical signature.', 20, 275);
  doc.text('For queries, contact support@dayflow.com', 145, 275);

  // Filename formatting
  const cleanMonth = slip.month.replace(/\s+/g, '_');
  doc.save(`Dayflow_Payslip_${slip.employeeId}_${cleanMonth}.pdf`);
};
