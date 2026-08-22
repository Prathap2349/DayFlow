// src/pages/auth/LoginPage.tsx
import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, ArrowRight } from 'lucide-react';
import { useAuth } from '../../auth/useAuth';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { DayflowLogo } from '../../components/shared/DayflowLogo';
import { supabase } from '../../db/supabaseClient';

export function LoginPage() {
  const { login, isAuthenticated, isLoading: authLoading, user } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Already authenticated — redirect based on their actual role
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
      await login({ email: email.trim(), password });
      // The AuthContext automatically sets the user state, and the redirect logic above handles navigation
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please verify credentials.');
      setIsLoading(false);
    }
  };

  const handleOAuthLogin = async (provider: 'google' | 'azure') => {
    setError('');
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/employee/dashboard`, // Fallback, AuthContext will sort it out
        }
      });
      if (error) throw error;
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to sign in with ${provider}`);
      setIsLoading(false);
    }
  };

  const fillDemoCredentials = (role: 'employee' | 'hr') => {
    if (role === 'hr') {
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
            'Enterprise Single Sign-On (SSO) Support',
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
            <h1 className="text-2xl font-bold text-slate-900">
              Welcome back
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Sign in to access your DayFlow workspace.
            </p>
          </div>

          <div className="space-y-3 mb-6">
            <button
              onClick={() => handleOAuthLogin('google')}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-700 font-medium transition-colors disabled:opacity-50"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Sign in with Google
            </button>
            <button
              onClick={() => handleOAuthLogin('azure')}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-700 font-medium transition-colors disabled:opacity-50"
            >
              <svg className="w-5 h-5" viewBox="0 0 21 21">
                <path fill="#f25022" d="M0 0h10v10H0z"/>
                <path fill="#7fba00" d="M11 0h10v10H11z"/>
                <path fill="#00a4ef" d="M0 11h10v10H0z"/>
                <path fill="#ffb900" d="M11 11h10v10H11z"/>
              </svg>
              Sign in with Microsoft
            </button>
          </div>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-slate-200"></div>
            <span className="text-slate-400 text-[11px] uppercase font-semibold">Or continue with email</span>
            <div className="flex-1 h-px bg-slate-200"></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email address"
              type="email"
              placeholder="you@company.com"
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
                  className="text-slate-400 focus-visible:outline-none focus-visible:text-indigo-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
              required
            />
            <div className="flex justify-end">
              <button type="button" className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">
                Forgot password?
              </button>
            </div>

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
            <p className="text-xs font-semibold text-amber-700 mb-2">🔑 Demo Testing</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => fillDemoCredentials('employee')}
                className="flex-1 py-1.5 bg-white border border-amber-200 text-amber-700 rounded text-xs font-medium hover:bg-amber-100 transition-colors"
              >
                Employee Demo
              </button>
              <button
                type="button"
                onClick={() => fillDemoCredentials('hr')}
                className="flex-1 py-1.5 bg-white border border-amber-200 text-amber-700 rounded text-xs font-medium hover:bg-amber-100 transition-colors"
              >
                HR Demo
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
