'use client';

import {
  ChevronDown,
  ChevronRight,
  FileCheck,
  FolderOpen,
  GraduationCap,
  HelpCircle,
  Home,
  LogOut,
  Menu,
  PenTool,
  Plus,
  Send,
  Settings,
  Sparkles,
  Target,
  UserCheck,
  Users,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import React, { useCallback, useState } from 'react';

import { Button } from '@/components/ui/button';

interface SidebarProps {
  className?: string;
  onCollapseChange?: (isCollapsed: boolean) => void;
  initialCollapsed?: boolean;
}

interface NavItem {
  label: string;
  href: string;
  icon: typeof Home;
  badge?: number;
  color?: string;
}

const Sidebar: React.FC<SidebarProps> = ({
  className = '',
  onCollapseChange,
  initialCollapsed = false,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(initialCollapsed);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [modulesExpanded, setModulesExpanded] = useState(true);
  const pathname = usePathname();

  const handleToggleCollapse = useCallback(() => {
    const newCollapsedState = !isCollapsed;
    setIsCollapsed(newCollapsedState);
    onCollapseChange?.(newCollapsedState);
  }, [isCollapsed, onCollapseChange]);

  // Navigation principale - essentiels uniquement
  const mainNavItems: NavItem[] = [
    {
      label: 'Tableau de bord',
      href: '/dashboard',
      icon: Home,
    },
    {
      label: 'Mes Candidats',
      href: '/mes-candidats',
      icon: Users,
    },
    {
      label: 'Mes Dossiers',
      href: '/mes-dossiers',
      icon: FolderOpen,
    },
    {
      label: 'CV Designer',
      href: '/cv-builder',
      icon: PenTool,
    },
  ];

  // Modules IA
  const moduleItems: NavItem[] = [
    {
      label: 'AO Reader',
      href: '/modules/ao-reader',
      icon: Sparkles,
      color: 'text-blue-500',
    },
    {
      label: 'Score',
      href: '/modules/score',
      icon: Target,
      color: 'text-green-500',
    },
    {
      label: 'Pré-Qualif',
      href: '/modules/pre-qualif',
      icon: UserCheck,
      color: 'text-purple-500',
    },
    {
      label: 'Reviewer',
      href: '/modules/reviewer',
      icon: FileCheck,
      color: 'text-red-500',
    },
    {
      label: 'Proposal',
      href: '/modules/proposal',
      icon: Send,
      color: 'text-orange-500',
    },
    {
      label: 'Coaching',
      href: '/modules/coaching',
      icon: GraduationCap,
      color: 'text-emerald-500',
    },
   
  ];

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant='ghost'
        size='sm'
        className='fixed z-50 shadow-lg top-4 left-4 lg:hidden bg-white/90 backdrop-blur-sm'
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? (
          <X className='w-5 h-5' />
        ) : (
          <Menu className='w-5 h-5' />
        )}
      </Button>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className='fixed inset-0 z-40 bg-black/50 lg:hidden'
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed left-0 top-0 h-full z-40 bg-white border-r border-gray-100 transition-all duration-300 ease-in-out flex flex-col
          ${isCollapsed ? 'w-[72px]' : 'w-64'}
          ${
            isMobileOpen
              ? 'translate-x-0'
              : '-translate-x-full lg:translate-x-0'
          }
          ${className}
        `}
      >
        {/* Header */}
        <div
          className={`flex items-center h-16 border-b border-gray-100 ${
            isCollapsed ? 'justify-center px-2' : 'justify-between px-4'
          }`}
        >
          <Link href='/dashboard' className='flex items-center gap-3'>
            <div className='flex items-center justify-center flex-shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700'>
              <span className='text-sm font-bold text-white'>DC</span>
            </div>
            {!isCollapsed && (
              <span className='text-lg font-bold text-gray-900'>DCBuilder</span>
            )}
          </Link>
          {!isCollapsed && (
            <button
              onClick={handleToggleCollapse}
              className='p-1.5 hover:bg-gray-100 rounded-lg hidden lg:block'
            >
              <Menu className='w-4 h-4 text-gray-500' />
            </button>
          )}
        </div>

        {/* Quick Create Button */}
        <div className={`p-3 ${isCollapsed ? 'px-2' : 'px-3'}`}>
          <Link
            href='/cv-builder'
            className={`w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors ${
              isCollapsed ? 'h-10 w-10 mx-auto' : 'h-11 px-4'
            }`}
          >
            <Plus className='w-5 h-5' />
            {!isCollapsed && <span className='font-medium'>Nouveau DC</span>}
          </Link>
        </div>

        {/* Main Navigation */}
        <nav className='flex-1 px-2 py-2 overflow-y-auto'>
          {/* Espace de travail */}
          <div className='space-y-1'>
            {mainNavItems.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileOpen(false)}
                  title={isCollapsed ? item.label : undefined}
                  className={`
                    flex items-center rounded-xl transition-all duration-150 group
                    ${
                      isCollapsed
                        ? 'justify-center h-11 w-11 mx-auto'
                        : 'gap-3 px-3 h-11'
                    }
                    ${
                      active
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }
                  `}
                >
                  <item.icon
                    className={`w-5 h-5 flex-shrink-0 ${
                      active
                        ? 'text-blue-600'
                        : 'text-gray-400 group-hover:text-gray-600'
                    }`}
                  />
                  {!isCollapsed && (
                    <>
                      <span className='flex-1 text-sm font-medium'>
                        {item.label}
                      </span>
                      {item.badge && (
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${
                            active
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Modules IA - Section collapsible */}
          <div className='pt-4 mt-4 border-t border-gray-100'>
            {!isCollapsed ? (
              <>
                <button
                  onClick={() => setModulesExpanded(!modulesExpanded)}
                  className='flex items-center justify-between w-full px-3 py-2 text-xs font-semibold tracking-wider text-gray-400 uppercase hover:text-gray-600'
                >
                  <span>Modules IA</span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${
                      modulesExpanded ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {modulesExpanded && (
                  <div className='mt-1 space-y-1'>
                    {moduleItems.map((item) => {
                      const active = isActive(item.href);
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setIsMobileOpen(false)}
                          className={`
                            flex items-center gap-3 px-3 h-10 rounded-xl transition-all duration-150 group
                            ${
                              active
                                ? 'bg-gray-100 text-gray-900'
                                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                            }
                          `}
                        >
                          <item.icon
                            className={`w-4 h-4 flex-shrink-0 ${item.color}`}
                          />
                          <span className='text-sm'>{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </>
            ) : (
              <div className='space-y-1'>
                {moduleItems.slice(0, 3).map((item) => {
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMobileOpen(false)}
                      title={item.label}
                      className={`
                        flex items-center justify-center h-10 w-10 mx-auto rounded-xl transition-all duration-150
                        ${active ? 'bg-gray-100' : 'hover:bg-gray-50'}
                      `}
                    >
                      <item.icon className={`w-4 h-4 ${item.color}`} />
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </nav>

        {/* Bottom Section */}
        <div
          className={`border-t border-gray-100 ${isCollapsed ? 'p-2' : 'p-3'}`}
        >
          {/* User Profile */}
          <div
            className={`mb-2 ${isCollapsed ? '' : 'p-3 bg-gray-50 rounded-xl'}`}
          >
            <div
              className={`flex items-center ${
                isCollapsed ? 'justify-center' : 'gap-3'
              }`}
            >
              <div className='flex items-center justify-center flex-shrink-0 rounded-full w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-600'>
                <span className='text-sm font-semibold text-white'>JD</span>
              </div>
              {!isCollapsed && (
                <div className='flex-1 min-w-0'>
                  <p className='text-sm font-medium text-gray-900 truncate'>
                    Jean Dupont
                  </p>
                  <p className='text-xs text-gray-500'>Plan Pro</p>
                </div>
              )}
            </div>
          </div>

          {/* Settings & Help */}
          <div className='space-y-1'>
            <Link
              href='/settings'
              onClick={() => setIsMobileOpen(false)}
              title={isCollapsed ? 'Paramètres' : undefined}
              className={`
                flex items-center rounded-xl transition-colors text-gray-600 hover:bg-gray-50 hover:text-gray-900
                ${
                  isCollapsed
                    ? 'justify-center h-10 w-10 mx-auto'
                    : 'gap-3 px-3 h-10'
                }
              `}
            >
              <Settings className='w-5 h-5 text-gray-400' />
              {!isCollapsed && <span className='text-sm'>Paramètres</span>}
            </Link>

            <button
              onClick={() => setIsMobileOpen(false)}
              title={isCollapsed ? 'Aide' : undefined}
              className={`
                flex items-center rounded-xl transition-colors text-gray-600 hover:bg-gray-50 hover:text-gray-900 w-full
                ${
                  isCollapsed
                    ? 'justify-center h-10 w-10 mx-auto'
                    : 'gap-3 px-3 h-10'
                }
              `}
            >
              <HelpCircle className='w-5 h-5 text-gray-400' />
              {!isCollapsed && <span className='text-sm'>Aide & Support</span>}
            </button>

            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              title={isCollapsed ? 'Déconnexion' : undefined}
              className={`
                flex items-center rounded-xl transition-colors text-gray-600 hover:bg-red-50 hover:text-red-600 w-full
                ${
                  isCollapsed
                    ? 'justify-center h-10 w-10 mx-auto'
                    : 'gap-3 px-3 h-10'
                }
              `}
            >
              <LogOut className='w-5 h-5 text-gray-400' />
              {!isCollapsed && <span className='text-sm'>Déconnexion</span>}
            </button>
          </div>

          {/* Collapse Toggle (desktop only) */}
          {isCollapsed && (
            <button
              onClick={handleToggleCollapse}
              className='flex items-center justify-center hidden w-10 h-10 mx-auto mt-2 hover:bg-gray-100 rounded-xl lg:flex'
            >
              <ChevronRight className='w-4 h-4 text-gray-400' />
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default Sidebar;
