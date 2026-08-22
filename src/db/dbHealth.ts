// src/db/dbHealth.ts
import { supabase, isSupabaseConfigured } from './supabaseClient';

export interface DbHealthStatus {
  isConfigured: boolean;
  isConnected: boolean;
  tablesExist: boolean;
  missingTables: string[];
  errorMessage?: string;
}

const REQUIRED_TABLES = ['profiles', 'employees', 'attendance', 'leave_requests', 'payroll_records', 'notifications'];

export async function checkDatabaseHealth(): Promise<DbHealthStatus> {
  if (!isSupabaseConfigured) {
    return {
      isConfigured: false,
      isConnected: false,
      tablesExist: false,
      missingTables: REQUIRED_TABLES,
      errorMessage: 'Supabase credentials are not set in .env file.',
    };
  }

  const missingTables: string[] = [];

  try {
    // Check main required table 'profiles' first
    const { error: profileErr } = await supabase
      .from('profiles')
      .select('id', { head: true, count: 'exact' });

    if (profileErr) {
      if (profileErr.code === 'PGRST205' || profileErr.message.includes('not find the table') || profileErr.message.includes('schema cache')) {
        return {
          isConfigured: true,
          isConnected: true,
          tablesExist: false,
          missingTables: REQUIRED_TABLES,
          errorMessage: 'Database tables have not been created in your Supabase project yet.',
        };
      }
    }

    // Quick test for all tables
    for (const table of REQUIRED_TABLES) {
      const { error } = await supabase.from(table).select('*', { head: true, count: 'exact' });
      if (error && (error.code === 'PGRST205' || error.message.includes('not find the table'))) {
        missingTables.push(table);
      }
    }

    if (missingTables.length > 0) {
      return {
        isConfigured: true,
        isConnected: true,
        tablesExist: false,
        missingTables,
        errorMessage: `Missing tables: ${missingTables.join(', ')}`,
      };
    }

    return {
      isConfigured: true,
      isConnected: true,
      tablesExist: true,
      missingTables: [],
    };
  } catch (err) {
    return {
      isConfigured: true,
      isConnected: false,
      tablesExist: false,
      missingTables: REQUIRED_TABLES,
      errorMessage: err instanceof Error ? err.message : 'Failed to connect to Supabase database.',
    };
  }
}
