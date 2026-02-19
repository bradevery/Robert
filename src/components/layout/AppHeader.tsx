'use client';

import { Bell, Search, Settings } from 'lucide-react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useCallback, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface AppHeaderProps {
  title?: string;
  subtitle?: string;
  showSearch?: boolean;
  actions?: React.ReactNode;
}

export default function AppHeader({
  title,
  subtitle,
  showSearch = false,
  actions,
}: AppHeaderProps) {
  const { data: session } = useSession();
  const [showNotifications, setShowNotifications] = useState(false);

  const userInitials = session?.user?.name
    ? session.user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'U';

  const handleNotificationToggle = useCallback(() => {
    setShowNotifications((prev) => !prev);
  }, []);

  const handleNotificationClose = useCallback(() => {
    setShowNotifications(false);
  }, []);

  return (
    <header className='sticky top-0 z-30 px-6 py-4 border-b border-gray-100 bg-white/80 backdrop-blur-sm'>
      <div className='flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between'>
        {/* Title Section */}
        {(title || subtitle) && (
          <div className='pl-12 lg:pl-0'>
            {title && (
              <h1 className='text-2xl font-bold text-gray-900'>{title}</h1>
            )}
            {subtitle && <p className='text-sm text-gray-500'>{subtitle}</p>}
          </div>
        )}

        {/* Actions Section */}
        <div className='flex flex-wrap items-center gap-3 ml-auto'>
          {/* Search */}
          {showSearch && (
            <div className='relative hidden sm:block'>
              <Search className='absolute w-4 h-4 text-gray-400 -translate-y-1/2 left-3 top-1/2' />
              <Input
                placeholder='Rechercher...'
                className='w-64 pl-10 rounded-xl'
              />
            </div>
          )}

          {/* Notifications */}
          <div className='relative'>
            <Button
              variant='ghost'
              size='icon'
              className='relative bg-white border border-gray-200 rounded-xl hover:bg-gray-50'
              onClick={handleNotificationToggle}
            >
              <Bell className='w-4 h-4 text-gray-500' />
              <span className='absolute -top-1 -right-1 text-[10px] bg-red-500 text-white rounded-full px-1.5 py-0.5'>
                3
              </span>
            </Button>

            {showNotifications && (
              <>
                <div
                  className='fixed inset-0 z-10'
                  onClick={handleNotificationClose}
                />
                <div className='absolute right-0 z-20 mt-2 bg-white border border-gray-100 shadow-lg w-72 rounded-xl'>
                  <div className='px-4 py-3 font-semibold text-gray-900 border-b border-gray-100'>
                    Notifications
                  </div>
                  <div className='p-4 text-sm text-center text-gray-500'>
                    Aucune notification
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Settings */}
          <Link href='/settings'>
            <Button
              variant='ghost'
              size='icon'
              className='bg-white border border-gray-200 rounded-xl hover:bg-gray-50'
            >
              <Settings className='w-4 h-4 text-gray-500' />
            </Button>
          </Link>

          {/* User Avatar */}
          <div className='flex items-center gap-3 px-3 py-2 border border-gray-200 rounded-xl'>
            <div className='flex items-center justify-center w-8 h-8 text-sm font-semibold text-white rounded-full bg-gradient-to-br from-blue-500 to-blue-600'>
              {userInitials}
            </div>
            <div className='hidden sm:block'>
              <p className='text-sm font-medium text-gray-900 truncate max-w-[120px]'>
                {session?.user?.name ?? 'Utilisateur'}
              </p>
            </div>
          </div>

          {/* Custom Actions */}
          {actions}
        </div>
      </div>
    </header>
  );
}
