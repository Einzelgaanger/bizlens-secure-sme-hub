
import React from 'react';
import { BarChart3, Layers } from 'lucide-react';

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
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className="relative">
        <div className={`${sizeClasses[size]} business-gradient rounded-lg flex items-center justify-center shadow-lg`}>
          <BarChart3 className={`${size === 'lg' ? 'h-7 w-7' : size === 'md' ? 'h-5 w-5' : 'h-4 w-4'} text-white`} />
        </div>
        <Layers className={`absolute -bottom-1 -right-1 ${size === 'lg' ? 'h-4 w-4' : 'h-3 w-3'} text-business-gold`} />
      </div>
      {showText && (
        <span className={`font-bold bg-gradient-to-r from-business-blue to-business-green bg-clip-text text-transparent ${textSizeClasses[size]}`}>
          BizLens
        </span>
      )}
    </div>
  );
};

export default Logo;
