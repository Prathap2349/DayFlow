// src/pages/employee/PlaceholderPage.tsx
import { useLocation } from 'react-router-dom';
import { ComingSoon } from '../../components/shared/ComingSoon';

const MODULE_INFO: Record<string, { title: string; desc: string }> = {
  '/employee/profile': {
    title: 'My Profile',
    desc: 'View and update your personal information, contact details, and professional summary.',
  },
  '/employee/attendance': {
    title: 'Attendance',
    desc: 'Track your daily check-in and check-out times, view attendance history, and see monthly reports.',
  },
  '/employee/leave': {
    title: 'Leave Requests',
    desc: 'Apply for leave, track the status of your requests, and view your leave balance.',
  },
  '/employee/notifications': {
    title: 'Notifications',
    desc: 'Stay up to date with announcements, approvals, and important HR updates.',
  },
};

export function EmployeePlaceholderPage() {
  const { pathname } = useLocation();
  const info = MODULE_INFO[pathname] ?? { title: 'Coming Soon', desc: undefined };
  return <ComingSoon module={info.title} description={info.desc} />;
}
