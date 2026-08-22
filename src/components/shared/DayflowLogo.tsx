// src/components/shared/DayflowLogo.tsx
interface DayflowLogoProps {
  size?: 'sm' | 'md' | 'lg';
  collapsed?: boolean;
}

const sizes = {
  sm: { icon: 28, text: 'text-lg' },
  md: { icon: 32, text: 'text-xl' },
  lg: { icon: 40, text: 'text-2xl' },
};

export function DayflowLogo({ size = 'md', collapsed = false }: DayflowLogoProps) {
  const { icon, text } = sizes[size];

  return (
    <div className="flex items-center gap-2.5">
      <svg
        width={icon}
        height={icon}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
        aria-hidden="true"
      >
        <rect width="32" height="32" rx="9" fill="#4F46E5" />
        <path
          d="M9 16C9 12.134 12.134 9 16 9s7 3.134 7 7-3.134 7-7 7"
          stroke="white"
          strokeWidth="2.3"
          strokeLinecap="round"
        />
        <circle cx="16" cy="16" r="2.5" fill="white" />
        <path d="M16 9v2M16 21v2M9 16h2M21 16h2" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      {!collapsed && (
        <span className={`font-bold text-slate-900 tracking-tight ${text}`}>
          Dayflow
        </span>
      )}
    </div>
  );
}
