// src/components/shared/ComingSoon.tsx
import { Construction } from 'lucide-react';

interface ComingSoonProps {
  module: string;
  description?: string;
}

export function ComingSoon({ module, description }: ComingSoonProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 animate-fade-in">
      <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center mb-5">
        <Construction className="w-7 h-7 text-indigo-500" />
      </div>
      <h2 className="text-xl font-bold text-slate-900 mb-2">{module}</h2>
      <p className="text-slate-500 text-sm max-w-sm">
        {description ??
          `The ${module} module is currently in development and will be available in an upcoming release.`}
      </p>
      <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 text-indigo-600 text-sm font-medium">
        <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
        Coming soon
      </div>
    </div>
  );
}
