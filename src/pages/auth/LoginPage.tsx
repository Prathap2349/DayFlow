// src/pages/auth/LoginPage.tsx
import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, ArrowRight } from 'lucide-react';
import { useAuth } from '../../auth/useAuth';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { DayflowLogo } from '../../components/shared/DayflowLogo';
import type { UserRole } from '../../types/auth';
import { clsx } from 'clsx';


export function LoginPage() {
  const { login, isAuthenticated, isLoading: authLoading, user } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState<UserRole>('employee');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Already authenticated — redirect
  if (!authLoading && isAuthenticated && user) {
    return <Navigate to={user.role === 'admin' || user.role === 'hr' ? '/admin/dashboard' : '/employee/dashboard'} replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Please enter your email and password.');
      return;
    }
    setError('');
    setIsLoading(true);
    try {
      await login({ email: email.trim(), password, role });
      navigate(role === 'admin' || role === 'hr' ? '/admin/dashboard' : '/employee/dashboard', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please verify credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemoCredentials = () => {
    if (role === 'admin' || role === 'hr') {
      setEmail('hr@dayflow.demo');
      setPassword('hr123');
    } else {
      setEmail('employee@dayflow.demo');
      setPassword('employee123');
    }
    setError('');
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white text-xs">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-[48%] xl:w-[52%] bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <svg width="40" height="40" viewBox="0 0 32 32" fill="none" aria-hidden="true">
              <rect width="32" height="32" rx="9" fill="white" fillOpacity="0.15" />
              <path d="M9 16C9 12.134 12.134 9 16 9s7 3.134 7 7-3.134 7-7 7" stroke="white" strokeWidth="2.3" strokeLinecap="round" />
              <circle cx="16" cy="16" r="2.5" fill="white" />
            </svg>
            <span className="text-2xl font-bold text-white tracking-tight">Dayflow</span>
          </div>
        </div>

        <div className="relative z-10 text-white">
          <h2 className="text-4xl font-bold leading-tight mb-4">
            Every workday,<br />
            <span className="text-indigo-200">perfectly aligned.</span>
          </h2>
          <p className="text-indigo-200 text-lg leading-relaxed mb-10">
            Manage your workforce, track attendance, handle leave requests, and streamline HR operations — all in one place.
          </p>

          {[
            'Real database mapping to Supabase PostgreSQL',
            'Real-time attendance punch card details',
            'Leave request reviews with notifications',
            'Spreadsheet CSV bulk upload',
          ].map(feature => (
            <div key={feature} className="flex items-center gap-3 mb-3">
              <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 12 12">
                  <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span className="text-indigo-100 text-sm">{feature}</span>
            </div>
          ))}
        </div>

        <div className="relative z-10">
          <p className="text-indigo-300 text-sm">© 2026 Dayflow. All rights reserved.</p>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex flex-col items-center justify-center px-5 py-12 sm:px-8">
        <div className="lg:hidden mb-8">
          <DayflowLogo size="lg" />
        </div>

        <div className="w-full max-w-sm">
          <div className="mb-8">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 text-center">
              Sign in as
            </p>
            <div className="flex gap-2 p-1 bg-slate-100 rounded-xl">
              {(['employee', 'hr'] as UserRole[]).map(r => (
                <button
                  key={r}
                  type="button"
                  onClick={() => { setRole(r); setError(''); }}
                  className={clsx(
                    'flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition-all duration-200',
                    role === r
                      ? 'bg-white text-indigo-700 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  )}
                >
                  {r === 'employee' ? 'Employee' : 'HR / Admin'}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-900">
              {role === 'hr' ? 'HR / Admin Login' : 'Employee Login'}
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              {role === 'hr' ? 'Sign in to manage your workforce.' : 'Sign in to view your work details.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email address"
              type="email"
              placeholder={role === 'hr' ? 'hr@dayflow.demo' : 'employee@dayflow.demo'}
              value={email}
              onChange={e => { setEmail(e.target.value); setError(''); }}
              leftIcon={<Mail className="w-4 h-4" />}
              required
            />

            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              value={password}
              onChange={e => { setPassword(e.target.value); setError(''); }}
              leftIcon={<Lock className="w-4 h-4" />}
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="text-slate-400"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
              required
            />

            {error && (
              <div role="alert" className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-100 text-red-700 text-xs">
                {error}
              </div>
            )}

            <Button
              type="submit"
              fullWidth
              size="lg"
              isLoading={isLoading}
              rightIcon={!isLoading ? <ArrowRight className="w-4 h-4" /> : undefined}
              className="mt-2"
            >
              Sign in
            </Button>
          </form>

          <div className="mt-6 p-4 rounded-xl bg-amber-50 border border-amber-100">
            <p className="text-xs font-semibold text-amber-700 mb-2">🔑 Demo account credentials</p>
            <div className="text-xs text-amber-700 space-y-1">
              <p><strong>Email:</strong> {role === 'hr' ? 'hr@dayflow.demo' : 'employee@dayflow.demo'}</p>
              <p><strong>Password:</strong> {role === 'hr' ? 'hr123' : 'employee123'}</p>
            </div>
            <button
              type="button"
              onClick={fillDemoCredentials}
              className="mt-2 text-xs font-medium text-amber-700 hover:text-amber-800 underline"
            >
              Fill credentials →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
