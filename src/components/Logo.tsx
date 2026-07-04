import iconImg from '../assets/images/17831484270633045358863284658791.jpg';
import wordmarkImg from '../assets/images/17831484348778486238767275883105.jpg';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'icon';
  className?: string;
}

const iconSizes = { sm: 40, md: 56, lg: 80, xl: 104 };
const wordmarkHeights = { sm: 20, md: 28, lg: 40, xl: 52 };

export default function Logo({ size = 'md', variant = 'full', className = '' }: LogoProps) {
  const iconSize = iconSizes[size];
  const wordmarkH = wordmarkHeights[size];

  /* mix-blend-mode: screen makes black pixels transparent,
     revealing only the blue/cyan gradient of the logo on dark backgrounds */
  const imgStyle: React.CSSProperties = {
    mixBlendMode: 'screen',
    objectFit: 'contain',
    display: 'block',
  };

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
