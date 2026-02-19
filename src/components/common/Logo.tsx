import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function Logo({ size = 'md', className = '' }: LogoProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-2xl',
  };

  const logoTextSizes = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-3xl',
  };

  return (
    <div className={`flex items-center space-x-2   ${className}`}>
      <div
        className={`${sizeClasses[size]} bg-gradient-to-r from-[#157fbe] to-[#1b5cc6] rounded-lg flex items-center justify-center`}
      >
        <span className={`${textSizes[size]} font-bold text-white`}>CV</span>
      </div>
      <span
        className={`${logoTextSizes[size]} font-bold text-gray-900`}
        style={{ marginBottom: '3px' }}
      >
        matchr
      </span>
    </div>
  );
}
