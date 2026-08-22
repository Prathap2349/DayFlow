// src/pages/admin/PlaceholderPage.tsx
import { useLocation } from 'react-router-dom';
import { ComingSoon } from '../../components/shared/ComingSoon';

const MODULE_INFO: Record<string, { title: string; desc: string }> = {
  '/admin/employees': {
    title: 'Employee Management',
    desc: 'Add, edit, and manage employee records, departments, roles, and job information.',
  },
  '/admin/attendance': {
    title: 'Attendance Management',
    desc: 'Monitor real-time attendance, view logs, and generate attendance reports by team.',
  },
  '/admin/leave': {
    title: 'Leave Management',
    desc: 'Review and process leave requests, configure leave policies, and track team leave calendars.',
  },
  '/admin/payroll': {
    title: 'Payroll',
    desc: 'Manage salary structures, process monthly payroll, generate payslips, and view payroll history.',
  },
  '/admin/reports': {
    title: 'Analytics & Reports',
    desc: 'Generate workforce analytics, attendance insights, leave summaries, and payroll reports.',
  },
  '/admin/notifications': {
    title: 'Notifications',
    desc: 'Send and manage announcements, alerts, and system-wide HR notifications.',
  },
  '/admin/settings': {
    title: 'Settings',
    desc: 'Configure company details, HR policies, working hours, and system preferences.',
  },
};

export function AdminPlaceholderPage() {
  const { pathname } = useLocation();
  const info = MODULE_INFO[pathname] ?? { title: 'Coming Soon', desc: undefined };
  return <ComingSoon module={info.title} description={info.desc} />;
}
