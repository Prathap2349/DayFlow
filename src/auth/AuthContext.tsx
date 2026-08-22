// src/auth/AuthContext.tsx
import React, { createContext, useCallback, useEffect, useState } from 'react';
import type { AuthContextValue, LoginCredentials, User, UserRole } from '../types/auth';
import { supabase, isSupabaseConfigured } from '../db/supabaseClient';

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = async (userId: string, email: string): Promise<User | null> => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*, employees(*)')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.warn('Warning fetching user profile:', error.message);
        // Fallback for user profile if profiles table is missing or query fails
        return {
          id: userId,
          name: email.split('@')[0] || 'User',
          email,
          role: email.includes('hr') || email.includes('admin') ? 'hr' : 'employee',
        };
      }

      if (!profile) {
        // Fallback for new auth user without profile created yet
        return {
          id: userId,
          name: email.split('@')[0] || 'User',
          email,
          role: email.includes('hr') || email.includes('admin') ? 'hr' : 'employee',
        };
      }

      const emp = profile.employees;
      return {
        id: profile.id,
        name: profile.full_name || emp?.name || email.split('@')[0],
        email: profile.email || email,
        role: (profile.role as UserRole) || 'employee',
        employeeId: profile.employee_id || undefined,
        avatar: profile.avatar_url || undefined,
        department: emp?.department || undefined,
        jobTitle: emp?.job_title || undefined,
      };
    } catch (e) {
      console.warn('Profile fetch failed gracefully:', e);
      return {
        id: userId,
        name: email.split('@')[0] || 'User',
        email,
        role: email.includes('hr') || email.includes('admin') ? 'hr' : 'employee',
      };
    }
  };

  // Initialize and listen to auth changes
  useEffect(() => {
    if (!isSupabaseConfigured) {
      setIsLoading(false);
      return;
    }

    let mounted = true;

    // Get current session safely
    supabase.auth
      .getSession()
      .then(({ data: { session } }: any) => {
        if (session?.user && mounted) {
          fetchProfile(session.user.id, session.user.email || '')
            .then((u) => {
              if (mounted) {
                setUser(u);
                setIsAuthenticated(!!u);
                setIsLoading(false);
              }
            })
            .catch((err) => {
              console.warn('Error processing user session profile:', err);
              if (mounted) setIsLoading(false);
            });
        } else {
          if (mounted) setIsLoading(false);
        }
      })
      .catch((err: any) => {
        console.warn('Supabase getSession failed:', err);
        if (mounted) setIsLoading(false);
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event: string, session: any) => {
      if (!mounted) return;
      if (session?.user) {
        const u = await fetchProfile(session.user.id, session.user.email || '');
        if (mounted) {
          setUser(u);
          setIsAuthenticated(!!u);
        }
      } else {
        if (mounted) {
          setUser(null);
          setIsAuthenticated(false);
        }
      }
      if (mounted) setIsLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase services are not configured. Please set your credentials.');
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data?.user) {
        const u = await fetchProfile(data.user.id, data.user.email || '');
        if (!u) {
          throw new Error('User profile record could not be loaded.');
        }

        // Verify role selection matches the database role
        const isUserHrAdmin = u.role === 'admin' || u.role === 'hr';
        const isSelectedHrAdmin = credentials.role === 'admin' || credentials.role === 'hr';

        if (u.role !== credentials.role && !(isUserHrAdmin && isSelectedHrAdmin)) {
          await supabase.auth.signOut().catch(() => {});
          throw new Error(
            `This account is registered as ${
              u.role === 'admin' || u.role === 'hr' ? 'HR / Admin' : 'Employee'
            }. Please select the correct login role.`
          );
        }

        setUser(u);
        setIsAuthenticated(true);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut().catch(() => {});
    }
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  const hasRole = useCallback(
    (role: UserRole) => {
      if (!user) return false;
      if (user.role === 'admin' && role === 'hr') return true;
      if (user.role === 'hr' && role === 'admin') return true;
      return user.role === role;
    },
    [user]
  );

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, logout, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
}
