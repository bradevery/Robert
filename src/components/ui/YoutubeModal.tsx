'use client';

import { X } from 'lucide-react';
import React from 'react';

interface YoutubeModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoId: string;
}

export default function YoutubeModal({
  isOpen,
  onClose,
  videoId,
}: YoutubeModalProps) {
  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className='fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm'
      onClick={handleBackdropClick}
    >
      <div className='relative w-full max-w-4xl mx-4 bg-black rounded-lg overflow-hidden shadow-2xl'>
        <button
          onClick={onClose}
          className='absolute top-4 right-4 z-10 p-2 text-white bg-black/50 rounded-full hover:bg-black/70 transition-colors'
        >
          <X className='w-5 h-5' />
        </button>

        <div className='relative w-full' style={{ paddingBottom: '56.25%' }}>
          <iframe
            className='absolute inset-0 w-full h-full'
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&controls=0&showinfo=0&rel=0&modestbranding=1&iv_load_policy=3&cc_load_policy=0&fs=0&disablekb=1`}
            title='Video démonstration'
            frameBorder='0'
            allow='autoplay; encrypted-media'
            allowFullScreen={false}
          />
        </div>
      </div>
    </div>
  );
}
