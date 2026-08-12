import React from 'react';

interface LuminaLogoProps {
  variant?: 'horizontal' | 'vertical' | 'icon';
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
  className?: string;
}

export const LuminaLogo: React.FC<LuminaLogoProps> = ({
  variant = 'horizontal',
  size = 'md',
  showTagline = false,
  className = '',
}) => {
  // Dimensions map
  const iconDimensions = {
    sm: { width: 28, height: 24 },
    md: { width: 38, height: 32 },
    lg: { width: 60, height: 52 },
  }[size];

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  }[size];

  const taglineSizeClasses = {
    sm: 'text-[8px]',
    md: 'text-[10px]',
    lg: 'text-xs',
  }[size];

  const SvgIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 160 140"
      width={iconDimensions.width}
      height={iconDimensions.height}
      aria-hidden="true"
      className="shrink-0"
    >
      <defs>
        <linearGradient id="blueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1A3D66" />
          <stop offset="100%" stopColor="#0F2540" />
        </linearGradient>
        <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFE082" />
          <stop offset="100%" stopColor="#FBC02D" />
        </linearGradient>
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      {/* Main Fluid Path (Swoosh) */}
      <path
        d="M 35,125 C 20,125 15,100 25,80 C 40,50 80,45 105,25 C 115,17 122,8 128,0 C 115,25 90,50 65,65 C 45,77 30,85 35,125 Z"
        fill="url(#blueGrad)"
      />
      {/* Secondary Fluid Arc */}
      <path
        d="M 20,110 C 35,115 55,100 75,80 C 95,60 110,40 115,35 C 105,48 85,72 65,88 C 45,104 28,112 20,110 Z"
        fill="#3B82F6"
        opacity="0.6"
      />
      {/* Light Beam / Star Burst */}
      <path
        d="M 135,10 L 138,22 L 150,25 L 138,28 L 135,40 L 132,28 L 120,25 L 132,22 Z"
        fill="url(#goldGrad)"
        filter="url(#glow)"
      />
      <path
        d="M 110,5 L 111.5,11 L 117.5,12.5 L 111.5,14 L 110,20 L 108.5,14 L 102.5,12.5 L 108.5,11 Z"
        fill="#FBC02D"
        opacity="0.85"
      />
      <circle cx="148" cy="8" r="3" fill="#FFE082" />
    </svg>
  );

  if (variant === 'icon') {
    return <div className={`inline-flex items-center ${className}`}>{SvgIcon}</div>;
  }

  if (variant === 'vertical') {
    return (
      <div className={`flex flex-col items-center gap-2 ${className}`}>
        {SvgIcon}
        <div className="text-center">
          <span className={`font-bold tracking-tight font-display ${textSizeClasses}`}>
            <span className="text-[#1A3D66]">Lumina</span>
            <span className="text-[#607D8B] font-light"> RH</span>
          </span>
          {showTagline && (
            <p className={`${taglineSizeClasses} text-[#5A6E85] uppercase tracking-[0.15em] mt-1 font-medium`}>
              Éclaire votre capital humain
            </p>
          )}
        </div>
      </div>
    );
  }

  // Horizontal variant (default)
  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      {SvgIcon}
      <div className="flex flex-col justify-center leading-none">
        <span className={`font-bold tracking-tight font-display ${textSizeClasses}`}>
          <span className="text-[#1A3D66]">Lumina</span>
          <span className="text-[#607D8B] font-light"> RH</span>
        </span>
        {showTagline && (
          <span className={`${taglineSizeClasses} text-[#5A6E85] uppercase tracking-[0.15em] mt-1 font-medium`}>
            Éclaire votre capital humain
          </span>
        )}
      </div>
    </div>
  );
};
