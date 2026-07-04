import iconImg from '../assets/images/17831484270633045358863284658791.jpg';
import wordmarkImg from '../assets/images/17831484348778486238767275883105.jpg';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'icon';
  className?: string;
  transparent?: boolean;
}

const iconSizes = { sm: 64, md: 88, lg: 128, xl: 176 };
const wordmarkHeights = { sm: 32, md: 44, lg: 64, xl: 88 };

export default function Logo({ size = 'md', variant = 'full', className = '', transparent = false }: LogoProps) {
  const iconSize = iconSizes[size];
  const wordmarkH = wordmarkHeights[size];

  const imgStyle: React.CSSProperties = {
    mixBlendMode: transparent ? 'screen' : 'multiply',
    objectFit: 'contain',
    display: 'block',
  };

  if (variant === 'icon') {
    const content = (
      <img src={iconImg} alt="Kerja Setara" width={iconSize} height={iconSize} style={imgStyle} />
    );

    if (transparent) {
      return (
        <div className={`flex-shrink-0 ${className}`} style={{ width: iconSize, height: iconSize }}>
          {content}
        </div>
      );
    }

    return (
      <div className={`flex-shrink-0 rounded-full bg-white p-1 ${className}`} style={{ width: iconSize + 8, height: iconSize + 8 }}>
        {content}
      </div>
    );
  }

  const content = (
    <>
      <img src={iconImg} alt="Kerja Setara icon" width={iconSize} height={iconSize} style={imgStyle} />
      <img
        src={wordmarkImg}
        alt="Kerja Setara"
        style={{ ...imgStyle, height: wordmarkH, width: 'auto' }}
      />
    </>
  );

  if (transparent) {
    return (
      <div className={`flex flex-col items-center ${className}`}>
        {content}
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center bg-white rounded-3xl px-6 py-4 ${className}`}>
      {content}
    </div>
  );
}
