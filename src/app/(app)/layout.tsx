'use client';

import React from 'react';

import Sidebar from '@/components/layout/Sidebar';

import { useUIStore } from '@/stores/ui-store';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { isSidebarCollapsed, setSidebarCollapsed } = useUIStore();

  return (
    <div className='flex min-h-screen bg-gray-50/50'>
      <Sidebar
        initialCollapsed={isSidebarCollapsed}
        onCollapseChange={setSidebarCollapsed}
      />
      <main
        className={`flex-1 min-h-screen transition-all duration-300 ease-in-out ${
          isSidebarCollapsed ? 'lg:ml-[72px]' : 'lg:ml-64'
        }`}
      >
        {children}
      </main>
    </div>
  );
}
