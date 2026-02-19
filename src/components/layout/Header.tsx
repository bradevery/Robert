'use client';

import { Download, FileCheck, Menu, UserCircle, X } from 'lucide-react';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';

import Logo from '@/components/common/Logo';
import { Button } from '@/components/ui/button';

import { useHeader } from '@/contexts/HeaderContext';

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isHeaderVisible } = useHeader();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!isHeaderVisible) {
    return null;
  }

  return (
    <header
      className={`fixed left-1/2 transform -translate-x-1/2 z-50 transition-all font-medium duration-500 w-full max-w-[1200px] px-4 sm:px-6 lg:px-8 ${
        isScrolled
          ? 'bg-white/70 backdrop-blur-xl border border-white/20 shadow-lg shadow-black/5'
          : 'bg-transparent border-b border-transparent'
      }`}
      style={{
        top: '10px',
        borderRadius: isScrolled ? '25px' : 0,
        paddingLeft: '20px',
        paddingRight: '20px',
        paddingTop: '5px',
        paddingBottom: '5px',
        backdropFilter: isScrolled ? 'blur(20px) saturate(180%)' : 'none',
        WebkitBackdropFilter: isScrolled ? 'blur(20px) saturate(180%)' : 'none',
      }}
    >
      <div className='py-2 mx-auto lg:py-3'>
        <div className='flex items-center justify-between'>
          <Link href='/'>
            <Logo size='md' />
          </Link>
          <nav className='items-center hidden space-x-8 md:flex'></nav>

          {/* Desktop Navigation */}
          <div className='items-center hidden space-x-4 lg:flex'>
            <Button variant='ghost' asChild>
              <Link href='/extension'>
                <Download className='w-4 h-4' />
                Télecharger l'extension
              </Link>
            </Button>
            <Button variant='ghost' asChild>
              <Link href='/login'>
                <UserCircle className='w-4 h-4' />
                Se connecter
              </Link>
            </Button>
            <Button asChild className='font-bold'>
              <Link href='/login'>
                <FileCheck className='w-4 h-4' /> Améliorer ma candidature
              </Link>
            </Button>
          </div>

          {/* Tablet Navigation */}
          <div className='items-center hidden space-x-2 md:flex lg:hidden'>
            <Button variant='ghost' size='sm' asChild>
              <Link href='/login'>
                <Download className='w-4 h-4' />
              </Link>
            </Button>
            <Button variant='ghost' size='sm' asChild>
              <Link href='/login'>
                <UserCircle className='w-4 h-4' />
              </Link>
            </Button>
            <Button size='sm' asChild className='font-bold'>
              <Link href='/login'>
                <FileCheck className='w-4 h-4' />
              </Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className='md:hidden'>
            <Button
              variant='ghost'
              size='sm'
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className='relative'
            >
              <div className='relative w-5 h-5'>
                <Menu
                  className={`w-5 h-5 absolute transition-all duration-500 ease-out ${
                    isMobileMenuOpen
                      ? 'opacity-0 rotate-180 scale-75'
                      : 'opacity-100 rotate-0 scale-100'
                  }`}
                />
                <X
                  className={`w-5 h-5 absolute transition-all duration-500 ease-out ${
                    isMobileMenuOpen
                      ? 'opacity-100 rotate-0 scale-100'
                      : 'opacity-0 -rotate-180 scale-75'
                  }`}
                />
              </div>
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={`md:hidden border-t border-white/20 overflow-hidden transition-all duration-700 ease-out ${
            isMobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div
            className={`px-6 py-4 space-y-3 transition-all duration-500 ease-out delay-100 ${
              isMobileMenuOpen
                ? 'translate-y-0 opacity-100'
                : '-translate-y-8 opacity-0'
            }`}
          >
            <Button
              variant='ghost'
              asChild
              className={`justify-start w-full transition-all duration-300 ease-out ${
                isMobileMenuOpen
                  ? 'delay-200 translate-x-0 opacity-100'
                  : 'delay-0 -translate-x-4 opacity-0'
              }`}
            >
              <Link href='/login' onClick={() => setIsMobileMenuOpen(false)}>
                <Download className='w-4 h-4 mr-2' />
                Télecharger l'extension
              </Link>
            </Button>
            <Button
              variant='ghost'
              asChild
              className={`justify-start w-full transition-all duration-300 ease-out ${
                isMobileMenuOpen
                  ? 'delay-300 translate-x-0 opacity-100'
                  : 'delay-0 -translate-x-4 opacity-0'
              }`}
            >
              <Link href='/login' onClick={() => setIsMobileMenuOpen(false)}>
                <UserCircle className='w-4 h-4 mr-2' />
                Se connecter
              </Link>
            </Button>
            <Button
              asChild
              className={`w-full font-bold transition-all duration-300 ease-out ${
                isMobileMenuOpen
                  ? 'delay-500 translate-x-0 opacity-100'
                  : 'delay-0 -translate-x-4 opacity-0'
              }`}
            >
              <Link href='/login' onClick={() => setIsMobileMenuOpen(false)}>
                <FileCheck className='w-4 h-4 mr-2' />
                Améliorer ma candidature
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
