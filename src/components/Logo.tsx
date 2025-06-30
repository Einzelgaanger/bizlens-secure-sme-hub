
import React from 'react';

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const Logo = ({ className = "", showText = true, size = 'md' }: LogoProps) => {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-3xl'
  };

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <img 
        src="/logo.png" 
        alt="BizLens Logo" 
        className={`${sizeClasses[size]} object-contain`}
      />
      {showText && (
        <span className={`font-bold text-blue-600 ${textSizeClasses[size]}`}>
          BizLens
        </span>
      )}
    </div>
  );
};

export default Logo;
