interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'icon';
  className?: string;
}

const sizes = {
  sm: { icon: 32, text: 'text-lg' },
  md: { icon: 48, text: 'text-2xl' },
  lg: { icon: 72, text: 'text-4xl' },
  xl: { icon: 96, text: 'text-5xl' },
};

export default function Logo({ size = 'md', variant = 'full', className = '' }: LogoProps) {
  const { icon: iconSize, text: textSize } = sizes[size];

  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      <svg width={iconSize} height={iconSize} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Kerja Setara Logo">
        <defs>
          <linearGradient id="circleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0d47a1" />
            <stop offset="50%" stopColor="#1565c0" />
            <stop offset="100%" stopColor="#0097a7" />
          </linearGradient>
          <linearGradient id="figureGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#1565c0" />
            <stop offset="100%" stopColor="#00bcd4" />
          </linearGradient>
        </defs>

        {/* Outer circle arc */}
        <circle cx="50" cy="50" r="44" stroke="url(#circleGrad)" strokeWidth="5" fill="none" strokeDasharray="240 40" strokeLinecap="round" />

        {/* Small dot on arc top right */}
        <circle cx="85" cy="25" r="4" fill="#00bcd4" />

        {/* Wheelchair figure (left) */}
        {/* Head */}
        <circle cx="34" cy="28" r="5" fill="url(#figureGrad)" />
        {/* Body */}
        <path d="M34 33 L34 48" stroke="url(#figureGrad)" strokeWidth="3.5" strokeLinecap="round" />
        {/* Arm reaching right */}
        <path d="M34 38 Q42 35 48 40" stroke="url(#figureGrad)" strokeWidth="3" strokeLinecap="round" fill="none" />
        {/* Wheelchair seat */}
        <path d="M26 48 L42 48" stroke="url(#figureGrad)" strokeWidth="3" strokeLinecap="round" />
        {/* Wheelchair back */}
        <path d="M26 42 L26 56" stroke="url(#figureGrad)" strokeWidth="3" strokeLinecap="round" />
        {/* Wheelchair wheel */}
        <circle cx="36" cy="58" r="8" stroke="url(#figureGrad)" strokeWidth="2.5" fill="none" />
        {/* Small front wheel */}
        <circle cx="24" cy="56" r="3" stroke="url(#figureGrad)" strokeWidth="2" fill="none" />

        {/* Standing figure (right) */}
        {/* Head */}
        <circle cx="66" cy="28" r="5" fill="url(#figureGrad)" />
        {/* Body */}
        <path d="M66 33 L66 52" stroke="url(#figureGrad)" strokeWidth="3.5" strokeLinecap="round" />
        {/* Arm reaching left (handshake) */}
        <path d="M66 38 Q58 35 52 40" stroke="url(#figureGrad)" strokeWidth="3" strokeLinecap="round" fill="none" />
        {/* Arm right */}
        <path d="M66 38 L72 45" stroke="url(#figureGrad)" strokeWidth="3" strokeLinecap="round" />
        {/* Legs */}
        <path d="M66 52 L60 68" stroke="url(#figureGrad)" strokeWidth="3" strokeLinecap="round" />
        <path d="M66 52 L72 68" stroke="url(#figureGrad)" strokeWidth="3" strokeLinecap="round" />

        {/* Handshake connection dot */}
        <circle cx="50" cy="40" r="3" fill="#00bcd4" />
      </svg>

      {variant === 'full' && (
        <div className={`font-bold ${textSize} leading-none tracking-tight`}>
          <span style={{ color: '#0d47a1' }}>Kerja</span>
          <span style={{ color: '#0097a7' }}>Setara</span>
        </div>
      )}
    </div>
  );
}
