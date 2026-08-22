// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './auth/AuthContext';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { EmployeeLayout } from './layouts/EmployeeLayout';
import { AdminLayout } from './layouts/AdminLayout';

// Auth Page
import { LoginPage } from './pages/auth/LoginPage';

// Employee Module Pages
import { EmployeeDashboardPage } from './pages/employee/DashboardPage';
import { EmployeeProfilePage } from './pages/employee/ProfilePage';
import { EmployeeAttendancePage } from './pages/employee/AttendancePage';
import { EmployeeLeavePage } from './pages/employee/LeavePage';
import { EmployeePayrollPage } from './pages/employee/PayrollPage';
import { EmployeeNotificationsPage } from './pages/employee/NotificationsPage';

// Admin Module Pages
import { AdminDashboardPage } from './pages/admin/DashboardPage';
import { AdminEmployeesPage } from './pages/admin/EmployeesPage';
import { AdminAttendancePage } from './pages/admin/AttendancePage';
import { AdminLeaveApprovalPage } from './pages/admin/LeaveApprovalPage';
import { AdminPayrollPage } from './pages/admin/PayrollPage';
import { AdminReportsPage } from './pages/admin/ReportsPage';
import { AdminNotificationsPage } from './pages/admin/NotificationsPage';
import { AdminSettingsPage } from './pages/admin/SettingsPage';

// Config Check
import { isSupabaseConfigured } from './db/supabaseClient';
import { AlertCircle, Database, HelpCircle } from 'lucide-react';
import { Button } from './components/ui/Button';

function ConfigurationErrorScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-6 py-12">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-100 p-8 text-center space-y-6">
        <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto">
          <Database className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900">Dayflow Connection Required</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            The Supabase credentials are not configured yet. Dayflow needs a database connection to load authentication and workforce details.
          </p>
        </div>

        <div className="bg-slate-50 p-4 rounded-xl text-left text-xs space-y-3 text-slate-600 border border-slate-100">
          <p className="font-semibold text-slate-800 flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 text-amber-500" /> Setup Instructions:
          </p>
          <ol className="list-decimal list-inside space-y-1.5">
            <li>Create a <code className="bg-slate-200 px-1 py-0.5 rounded font-mono">.env</code> file in the project root directory.</li>
            <li>Copy keys from <code className="bg-slate-200 px-1 py-0.5 rounded font-mono">.env.example</code>.</li>
            <li>Paste your Supabase URL & Anon Key.</li>
            <li>Restart the development server.</li>
          </ol>
        </div>

        <Button
          fullWidth
          leftIcon={<HelpCircle className="w-4 h-4" />}
          onClick={() => window.open('https://supabase.com', '_blank')}
        >
          Go to Supabase Dashboard
        </Button>
      </div>
    </div>
  );
}

export default function App() {
  if (!isSupabaseConfigured) {
    return <ConfigurationErrorScreen />;
  }

  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Login Route */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected Employee Routes */}
          <Route
            path="/employee"
            element={
              <ProtectedRoute requiredRole="employee">
                <EmployeeLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<EmployeeDashboardPage />} />
            <Route path="profile" element={<EmployeeProfilePage />} />
            <Route path="attendance" element={<EmployeeAttendancePage />} />
            <Route path="leave" element={<EmployeeLeavePage />} />
            <Route path="payroll" element={<EmployeePayrollPage />} />
            <Route path="notifications" element={<EmployeeNotificationsPage />} />
          </Route>

          {/* Protected Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute requiredRole="hr">
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboardPage />} />
            <Route path="employees" element={<AdminEmployeesPage />} />
            <Route path="attendance" element={<AdminAttendancePage />} />
            <Route path="leave" element={<AdminLeaveApprovalPage />} />
            <Route path="payroll" element={<AdminPayrollPage />} />
            <Route path="reports" element={<AdminReportsPage />} />
            <Route path="notifications" element={<AdminNotificationsPage />} />
            <Route path="settings" element={<AdminSettingsPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>

      {/* Global Toast Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            background: '#fff',
            color: '#0f172a',
            borderRadius: '10px',
            border: '1px solid #e2e8f0',
            fontSize: '14px',
            boxShadow: '0 4px 24px -4px rgba(0,0,0,0.12)',
          },
          success: {
            iconTheme: { primary: '#10b981', secondary: '#fff' },
          },
          error: {
            iconTheme: { primary: '#f43f5e', secondary: '#fff' },
          },
        }}
      />
    </AuthProvider>
  );
}
