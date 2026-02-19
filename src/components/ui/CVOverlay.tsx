'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */

import React from 'react';

interface CVOverlayProps {
  isVisible: boolean;
  selectedItem?: string;
  children: React.ReactNode;
}

export const CVOverlay: React.FC<CVOverlayProps> = ({
  isVisible,
  selectedItem,
  children,
}) => {
  if (!isVisible) {
    return <>{children}</>;
  }

  return (
    <div className='relative'>
      {/* Overlay */}
      <div className='absolute inset-0 bg-gray-900 bg-opacity-20 z-10 pointer-events-none' />

      {/* Content with conditional highlighting */}
      <div className='relative z-20'>
        {React.Children.map(children, (child, _index) => {
          if (React.isValidElement(child)) {
            const itemId = child.props['data-section-item'];
            const isSelected = itemId === selectedItem;

            return React.cloneElement(child as React.ReactElement<any>, {
              style: {
                ...child.props.style,
                position: 'relative',
                zIndex: isSelected ? 30 : 20,
                backgroundColor: isSelected ? 'white' : undefined,
                borderRadius: isSelected ? '8px' : undefined,
                boxShadow: isSelected
                  ? '0 4px 12px rgba(0, 0, 0, 0.15)'
                  : undefined,
              },
            });
          }
          return child;
        })}
      </div>
    </div>
  );
};
