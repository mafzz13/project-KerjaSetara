interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'icon';
  className?: string;
}

const sizes = {
  sm: { icon: 32, textScale: 0.8 },
  md: { icon: 48, textScale: 1 },
  lg: { icon: 72, textScale: 1.4 },
  xl: { icon: 96, textScale: 1.8 },
};

/* Icon SVG that closely matches the provided brand mark:
   - Circular arc (open at bottom-left) with blue→cyan gradient
   - Wheelchair figure (left) + standing figure (right) handshaking
   - Small dot at top-right of arc */
function LogoIcon({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="ks-main" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1a35e0" />
          <stop offset="50%" stopColor="#1565c0" />
          <stop offset="100%" stopColor="#00c2f3" />
        </linearGradient>
        <linearGradient id="ks-fig" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1a35e0" />
          <stop offset="100%" stopColor="#00c2f3" />
        </linearGradient>
        <linearGradient id="ks-arc" x1="20%" y1="0%" x2="80%" y2="100%">
          <stop offset="0%" stopColor="#1a35e0" />
          <stop offset="100%" stopColor="#00c2f3" />
        </linearGradient>
      </defs>

      {/* Outer arc — open gap at bottom-left (approx 60° gap) */}
      <path
        d="M 100 10
           A 90 90 0 1 1 20 145"
        stroke="url(#ks-arc)"
        strokeWidth="13"
        strokeLinecap="round"
        fill="none"
      />

      {/* Small dot at top-right of arc */}
      <circle cx="175" cy="60" r="10" fill="#00c2f3" />

      {/* ── Wheelchair figure (left) ── */}
      {/* Head */}
      <circle cx="72" cy="52" r="11" fill="url(#ks-fig)" />
      {/* Torso */}
      <path d="M72 63 L72 90" stroke="url(#ks-fig)" strokeWidth="8" strokeLinecap="round" />
      {/* Arm reaching right (handshake) */}
      <path d="M72 76 Q90 68 102 78" stroke="url(#ks-fig)" strokeWidth="7" strokeLinecap="round" fill="none" />
      {/* Seat */}
      <path d="M55 90 L88 90" stroke="url(#ks-fig)" strokeWidth="7" strokeLinecap="round" />
      {/* Backrest */}
      <path d="M55 78 L55 98" stroke="url(#ks-fig)" strokeWidth="7" strokeLinecap="round" />
      {/* Main wheel */}
      <circle cx="76" cy="118" r="18" stroke="url(#ks-fig)" strokeWidth="6" fill="none" />
      {/* Front small wheel */}
      <circle cx="50" cy="112" r="7" stroke="url(#ks-fig)" strokeWidth="5" fill="none" />
      {/* Leg on seat */}
      <path d="M72 90 L88 112" stroke="url(#ks-fig)" strokeWidth="7" strokeLinecap="round" />

      {/* ── Standing figure (right) ── */}
      {/* Head */}
      <circle cx="135" cy="52" r="11" fill="url(#ks-fig)" />
      {/* Torso */}
      <path d="M135 63 L135 105" stroke="url(#ks-fig)" strokeWidth="8" strokeLinecap="round" />
      {/* Arm reaching left (handshake) */}
      <path d="M135 76 Q118 68 106 78" stroke="url(#ks-fig)" strokeWidth="7" strokeLinecap="round" fill="none" />
      {/* Arm right (raised / gesture) */}
      <path d="M135 76 L155 95" stroke="url(#ks-fig)" strokeWidth="7" strokeLinecap="round" />
      {/* Legs */}
      <path d="M135 105 L120 145" stroke="url(#ks-fig)" strokeWidth="7" strokeLinecap="round" />
      <path d="M135 105 L150 145" stroke="url(#ks-fig)" strokeWidth="7" strokeLinecap="round" />

      {/* Handshake connection dot */}
      <circle cx="104" cy="78" r="6" fill="#00c2f3" />
    </svg>
  );
}

/* Wordmark: "Kerja" in dark navy + "Setara" in bright blue,
   matching the two-tone typography of the provided brand image */
function LogoWordmark({ scale }: { scale: number }) {
  const base = 28 * scale;
  return (
    <div
      style={{
        fontSize: base,
        fontWeight: 800,
        letterSpacing: '-0.02em',
        lineHeight: 1,
        display: 'flex',
        alignItems: 'baseline',
        gap: scale * 3,
        fontFamily: "'Inter', 'DM Sans', system-ui, sans-serif",
      }}
    >
      <span style={{ color: '#1a237e' }}>Kerja</span>
      <span style={{ color: '#1565c0', background: 'linear-gradient(90deg, #1565c0 0%, #00c2f3 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Setara</span>
    </div>
  );
}

export default function Logo({ size = 'md', variant = 'full', className = '' }: LogoProps) {
  const { icon: iconSize, textScale } = sizes[size];

  if (variant === 'icon') {
    return (
      <div className={`flex-shrink-0 ${className}`}>
        <LogoIcon size={iconSize} />
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      <LogoIcon size={iconSize} />
      <LogoWordmark scale={textScale} />
    </div>
  );
}
