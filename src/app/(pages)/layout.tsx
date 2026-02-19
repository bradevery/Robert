import React from 'react';

import Footer from '@/components/layout/Footer';
import Header from '@/components/layout/Header';

import { HeaderProvider } from '@/contexts/HeaderContext';

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <HeaderProvider>
      <Header />
      <main>{children}</main>
      <Footer />
    </HeaderProvider>
  );
}
