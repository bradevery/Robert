'use client';

import { ChevronUp } from 'lucide-react';
import React, { useEffect, useState } from 'react';

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  if (!isVisible) {
    return null;
  }

  return (
    <button
      onClick={scrollToTop}
      className={`
        fixed bottom-6 right-6 z-50
        w-12 h-12 
        bg-gradient-to-r from-[#157fbe] to-[#1b5cc6]
        text-white
        rounded-full
        shadow-lg hover:shadow-xl
        transition-all duration-300 ease-in-out
        hover:scale-110 hover:-translate-y-1
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        backdrop-blur-sm
        border border-white/10
      `}
      aria-label='Retour en haut'
    >
      <ChevronUp className='w-6 h-6 mx-auto' />
    </button>
  );
}
