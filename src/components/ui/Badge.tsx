// src/components/ui/Badge.tsx
import { clsx } from 'clsx';

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
  dot?: boolean;
}

const variants: Record<BadgeVariant, string> = {
  default:  'bg-slate-100 text-slate-700',
  success:  'bg-emerald-50 text-emerald-700',
  warning:  'bg-amber-50 text-amber-700',
  danger:   'bg-red-50 text-red-700',
  info:     'bg-blue-50 text-blue-700',
  purple:   'bg-violet-50 text-violet-700',
};

const dotColors: Record<BadgeVariant, string> = {
  default:  'bg-slate-400',
  success:  'bg-emerald-500',
  warning:  'bg-amber-500',
  danger:   'bg-red-500',
  info:     'bg-blue-500',
  purple:   'bg-violet-500',
};

export function Badge({ variant = 'default', children, className, dot = false }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium',
        variants[variant],
        className
      )}
    >
      {dot && (
        <span className={clsx('w-1.5 h-1.5 rounded-full shrink-0', dotColors[variant])} />
      )}
      {children}
    </span>
  );
}

// Convenience wrappers for common use cases
export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, BadgeVariant> = {
    Active: 'success',
    'On Leave': 'warning',
    Absent: 'danger',
    Inactive: 'default',
    Pending: 'warning',
    Approved: 'success',
    Rejected: 'danger',
    Present: 'success',
    'Half Day': 'info',
  };
  return (
    <Badge variant={map[status] ?? 'default'} dot>
      {status}
    </Badge>
  );
}
