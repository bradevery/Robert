'use client';

import { Monitor, Moon, Sun } from 'lucide-react';
import React, { useEffect, useState } from 'react';

import { Button } from './button';

type Theme = 'light' | 'dark' | 'system';

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('system');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Récupérer le thème depuis localStorage
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const root = window.document.documentElement;

    // Supprimer les classes précédentes
    root.classList.remove('light', 'dark');

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)')
        .matches
        ? 'dark'
        : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }

    // Sauvegarder dans localStorage
    localStorage.setItem('theme', theme);
  }, [theme, mounted]);

  const cycleTheme = () => {
    setTheme((prev) => {
      switch (prev) {
        case 'light':
          return 'dark';
        case 'dark':
          return 'system';
        case 'system':
          return 'light';
        default:
          return 'light';
      }
    });
  };

  if (!mounted) {
    return (
      <Button variant='ghost' size='sm'>
        <Sun className='h-4 w-4' />
      </Button>
    );
  }

  const getIcon = () => {
    switch (theme) {
      case 'light':
        return <Sun className='h-4 w-4' />;
      case 'dark':
        return <Moon className='h-4 w-4' />;
      case 'system':
        return <Monitor className='h-4 w-4' />;
      default:
        return <Sun className='h-4 w-4' />;
    }
  };

  const getLabel = () => {
    switch (theme) {
      case 'light':
        return 'Mode clair';
      case 'dark':
        return 'Mode sombre';
      case 'system':
        return 'Mode système';
      default:
        return 'Mode clair';
    }
  };

  return (
    <Button
      variant='ghost'
      size='sm'
      onClick={cycleTheme}
      title={getLabel()}
      className='relative'
    >
      {getIcon()}
      <span className='sr-only'>{getLabel()}</span>
    </Button>
  );
}

// Hook pour utiliser le thème dans les composants
export function useTheme() {
  const [theme, setTheme] = useState<Theme>('system');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)')
        .matches
        ? 'dark'
        : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }

    localStorage.setItem('theme', theme);
  }, [theme, mounted]);

  return {
    theme,
    setTheme,
    mounted,
  };
}
