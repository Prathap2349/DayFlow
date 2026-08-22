// src/App.tsx
import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './auth/AuthContext';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { EmployeeLayout } from './layouts/EmployeeLayout';
import { AdminLayout } from './layouts/AdminLayout';
import { ErrorBoundary } from './components/shared/ErrorBoundary';

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

// Config Check & DB Health
import { isSupabaseConfigured } from './db/supabaseClient';
import { checkDatabaseHealth, DbHealthStatus } from './db/dbHealth';
import { AlertCircle, Database, HelpCircle, Check, Copy, Terminal, ExternalLink, RefreshCw } from 'lucide-react';
import { Button } from './components/ui/Button';
import toast from 'react-hot-toast';

function ConfigurationErrorScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-6 py-12">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-100 p-8 text-center space-y-6 animate-fade-in">
        <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto">
          <Database className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-slate-900">Dayflow Connection Required</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            The Supabase credentials are not configured yet. Dayflow needs a database connection to load authentication and workforce details.
          </p>
        </div>

        <div className="bg-slate-50 p-4 rounded-xl text-left text-xs space-y-3 text-slate-600 border border-slate-100">
          <p className="font-semibold text-slate-800 flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 text-amber-500" /> Setup Instructions:
          </p>
          <ol className="list-decimal list-inside space-y-1.5 font-mono text-[11px]">
            <li>Create a <code className="bg-slate-200 px-1 py-0.5 rounded">.env</code> file in project root.</li>
            <li>Copy keys from <code className="bg-slate-200 px-1 py-0.5 rounded">.env.example</code>.</li>
            <li>Paste your Supabase URL & Anon Key.</li>
            <li>Restart dev server.</li>
          </ol>
        </div>

        <Button
          fullWidth
          leftIcon={<HelpCircle className="w-4 h-4" />}
          onClick={() => window.open('https://supabase.com/dashboard', '_blank')}
        >
          Go to Supabase Dashboard
        </Button>
      </div>
    </div>
  );
}

function SchemaSetupRequiredScreen({ status, onRetry }: { status: DbHealthStatus; onRetry: () => void }) {
  const [copied, setCopied] = useState(false);

  const handleCopyInstructions = () => {
    const textToCopy = `Please execute the SQL migration script from 'supabase/migrations/20260822000000_init.sql' in your Supabase SQL Editor.`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    toast.success('Instructions copied to clipboard!');
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-6 py-12">
      <div className="max-w-xl w-full bg-white rounded-2xl shadow-xl border border-slate-100 p-8 space-y-6 animate-fade-in">
        <div className="flex items-center gap-4 border-b border-slate-100 pb-5">
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center shrink-0">
            <Terminal className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Supabase Database Tables Required</h2>
            <p className="text-xs text-slate-500">
              Connected to Supabase! However, the database tables have not been created yet.
            </p>
          </div>
        </div>

        <div className="bg-amber-50/80 border border-amber-200/60 rounded-xl p-4 text-xs text-amber-800 space-y-2">
          <p className="font-semibold flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 text-amber-600" /> Database Status:
          </p>
          <p className="text-amber-900 leading-relaxed">
            {status.errorMessage || 'Required tables (profiles, employees, attendance, leave_requests) were not found in your Supabase project.'}
          </p>
        </div>

        <div className="bg-slate-900 text-slate-100 rounded-xl p-4 text-xs space-y-3 font-mono">
          <div className="flex items-center justify-between text-slate-400 text-[11px] pb-2 border-b border-slate-800">
            <span>SQL Setup Migration Script</span>
            <span>supabase/migrations/20260822000000_init.sql</span>
          </div>
          <p className="text-emerald-400"># Step-by-step setup:</p>
          <ol className="list-decimal list-inside space-y-1.5 text-slate-300">
            <li>Open your <span className="text-indigo-300 font-semibold">Supabase Dashboard</span> → <span className="text-indigo-300 font-semibold">SQL Editor</span>.</li>
            <li>Open <code className="text-amber-300">supabase/migrations/20260822000000_init.sql</code> from this project.</li>
            <li>Copy the entire SQL content and paste it into the SQL Editor.</li>
            <li>Click <strong className="text-white">Run</strong> to create all tables and initial demo data.</li>
          </ol>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Button
            variant="outline"
            fullWidth
            leftIcon={copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            onClick={handleCopyInstructions}
          >
            {copied ? 'Copied!' : 'Copy Instructions'}
          </Button>
          <Button
            variant="outline"
            fullWidth
            leftIcon={<ExternalLink className="w-4 h-4" />}
            onClick={() => window.open('https://supabase.com/dashboard', '_blank')}
          >
            Open SQL Editor
          </Button>
          <Button
            fullWidth
            leftIcon={<RefreshCw className="w-4 h-4" />}
            onClick={onRetry}
          >
            Check Again
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [dbHealth, setDbHealth] = useState<DbHealthStatus | null>(null);
  const [checkingHealth, setCheckingHealth] = useState(true);

  const verifyHealth = async () => {
    setCheckingHealth(true);
    if (!isSupabaseConfigured) {
      setCheckingHealth(false);
      return;
    }
    const health = await checkDatabaseHealth();
    setDbHealth(health);
    setCheckingHealth(false);
  };

  useEffect(() => {
    verifyHealth();
  }, []);

  if (!isSupabaseConfigured) {
    return <ConfigurationErrorScreen />;
  }

  if (checkingHealth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center animate-bounce">
            <Database className="w-5 h-5 text-white" />
          </div>
          <p className="text-xs font-semibold text-slate-500">Connecting to database...</p>
        </div>
      </div>
    );
  }

  if (dbHealth && !dbHealth.tablesExist) {
    return <SchemaSetupRequiredScreen status={dbHealth} onRetry={verifyHealth} />;
  }

  return (
    <ErrorBoundary>
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
    </ErrorBoundary>
  );
}
