import * as Sentry from '@sentry/nextjs';
import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import NextTopLoader from 'nextjs-toploader';
import * as React from 'react';
import { Toaster } from 'react-hot-toast';
import 'dayjs/locale/fr';

import '@/styles/globals.css';

// import { SocketProvider } from '@/providers/socket-provider';
import BootstrapClient from '@/components/BootstrapClient';

import { siteConfig } from '@/constant/config';
import NextAuthProvider from '@/providers/next-auth-provider';
import Providers from '@/providers/react-query-provider';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['200', '300', '400', '500', '600', '700', '800'],
  variable: '--font-plus-jakarta-sans',
});

export const metadata: Metadata = {
  title: {
    default: siteConfig.title,
    template: `%s | ${siteConfig.title}`,
  },
  description: siteConfig.description,
  robots: { index: true, follow: true },
  icons: {
    icon: '/favicon/favicon.ico',
    shortcut: '/favicon/favicon-16x16.png',
    apple: '/favicon/apple-touch-icon.png',
  },
  manifest: `/favicon/site.webmanifest`,
  openGraph: {
    url: siteConfig.url,
    title: siteConfig.title,
    description: siteConfig.description,
    siteName: siteConfig.title,
    images: [`${siteConfig.url}/images/og.jpg`],
    type: 'website',
    locale: 'fr_FR',
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.title,
    description: siteConfig.description,
    images: [`${siteConfig.url}/images/og.jpg`],
  },
  other: {
    ...Sentry.getTraceData(),
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='fr' className={plusJakartaSans.variable}>
      <body>
        {/* <PostHogProvider> */}
        <Toaster position='top-center' />
        <NextAuthProvider>
          <Providers>
            <NextTopLoader
              color='#1b5cc6'
              initialPosition={0.08}
              crawlSpeed={200}
              height={5}
              crawl={true}
              showSpinner={true}
              easing='ease'
              speed={200}
              shadow='0 0 10px #1b5cc6,0 0 5px #005e53'
            />
            {children}
          </Providers>
        </NextAuthProvider>
        <BootstrapClient />
        {/* </PostHogProvider> */}
      </body>
    </html>
  );
}
