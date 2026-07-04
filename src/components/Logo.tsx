import iconImg from '../assets/images/6_20260704_141539_0000.svg';
import wordmarkImg from '../assets/images/7_20260704_141539_0001.svg';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'icon';
  className?: string;
  transparent?: boolean;
  wordmarkScale?: number;
}

const iconSizes = { sm: 128, md: 160, lg: 224, xl: 320 };
const wordmarkHeights = { sm: 96, md: 120, lg: 168, xl: 240 };

export default function Logo({ size = 'md', variant = 'full', className = '', transparent = false, wordmarkScale = 1 }: LogoProps) {
  const iconSize = iconSizes[size];
  const wordmarkH = Math.round(wordmarkHeights[size] * wordmarkScale);

  // Assets are white-on-black. screen makes black transparent (white logo on dark bg);
  // invert + multiply flips to black-on-white and removes the white (black logo on light bg).
  const imgStyle: React.CSSProperties = transparent
    ? { mixBlendMode: 'screen', objectFit: 'contain', display: 'block' }
    : { mixBlendMode: 'multiply', filter: 'invert(1)', objectFit: 'contain', display: 'block' };

  if (variant === 'icon') {
    return (
      <div className={`flex-shrink-0 ${className}`} style={{ width: iconSize, height: iconSize }}>
        <img src={iconImg} alt="Kerja Setara" width={iconSize} height={iconSize} style={imgStyle} />
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <img src={iconImg} alt="Kerja Setara icon" width={iconSize} height={iconSize} style={imgStyle} />
      <img
        src={wordmarkImg}
        alt="Kerja Setara"
        style={{ ...imgStyle, height: wordmarkH, width: 'auto' }}
      />
    </div>
  );
}
