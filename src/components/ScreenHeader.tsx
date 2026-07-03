import { ChevronLeft } from 'lucide-react';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  right?: React.ReactNode;
  transparent?: boolean;
  light?: boolean;
}

export default function ScreenHeader({ title, subtitle, onBack, right, transparent, light }: ScreenHeaderProps) {
  const bg = transparent ? 'bg-transparent' : light ? 'bg-white border-b border-slate-100' : 'bg-white border-b border-slate-100';
  const textColor = light || !transparent ? 'text-slate-900' : 'text-white';
  const subColor = light || !transparent ? 'text-slate-500' : 'text-white/70';
  const iconColor = light || !transparent ? 'text-slate-700' : 'text-white';

  return (
    <div className={`flex items-center gap-3 px-4 h-14 flex-shrink-0 ${bg}`} style={{ paddingTop: 'env(safe-area-inset-top)' }}>
      {onBack && (
        <button
          onClick={onBack}
          className={`w-9 h-9 rounded-xl flex items-center justify-center -ml-1 transition-all active:scale-95 ${!transparent ? 'hover:bg-slate-100' : 'hover:bg-white/10'}`}
        >
          <ChevronLeft size={22} className={iconColor} />
        </button>
      )}
      <div className="flex-1 min-w-0">
        <h1 className={`font-bold text-base leading-tight truncate ${textColor}`}>{title}</h1>
        {subtitle && <p className={`text-xs leading-none mt-0.5 truncate ${subColor}`}>{subtitle}</p>}
      </div>
      {right && <div className="flex-shrink-0">{right}</div>}
    </div>
  );
}
