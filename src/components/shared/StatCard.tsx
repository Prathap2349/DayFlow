// src/components/shared/StatCard.tsx
import { clsx } from 'clsx';

interface StatCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  icon: React.ReactNode;
  iconBg?: string;
  trend?: { value: string; positive: boolean };
  className?: string;
}

export function StatCard({
  label,
  value,
  subtext,
  icon,
  iconBg = 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400',
  trend,
  className,
}: StatCardProps) {
  return (
    <div
      className={clsx(
        'bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-100 dark:border-slate-800/80 shadow-sm p-5 flex items-start gap-4 hover-lift',
        className
      )}
    >
      <div className={clsx('w-11 h-11 rounded-xl flex items-center justify-center shrink-0', iconBg)}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{label}</p>
        <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1 leading-none">{value}</p>
        <div className="flex items-center gap-2 mt-1.5">
          {subtext && <p className="text-xs text-slate-400 dark:text-slate-500">{subtext}</p>}
          {trend && (
            <span
              className={clsx(
                'text-xs font-medium',
                trend.positive ? 'text-emerald-600' : 'text-red-500'
              )}
            >
              {trend.positive ? '↑' : '↓'} {trend.value}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
