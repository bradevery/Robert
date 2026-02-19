import { NextResponse } from 'next/server';
import NextAuth from 'next-auth';

import { authConfig } from '@/auth.config';

const { auth } = NextAuth(authConfig);

// Routes that don't require authentication
const publicRoutes = [
  '/',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
  '/extension',
  '/terms',
  '/privacy',
  '/demo',
  '/pricing',
];

// Routes that are part of the app (require auth)
const appRoutes = [
  '/dashboard',
  '/cv-builder',
  '/mes-dossiers',
  '/mes-candidats',
  '/mes-clients',
  '/mes-cvs',
  '/chat',
  '/settings',
  '/modules',
];

// Onboarding routes
const onboardingRoutes = [
  '/onboarding/welcome',
  '/onboarding/profile',
  '/onboarding/organization',
  '/onboarding/invite-team',
  '/onboarding/first-dc',
];

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const pathname = nextUrl.pathname;

  // Check if the current route is public
  const isPublicRoute = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  // Check if it's an app route
  const isAppRoute = appRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  // Check if it's an onboarding route
  const isOnboardingRoute = onboardingRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  // Check if it's an API route
  const isApiRoute = pathname.startsWith('/api');

  // Check if it's a static file
  const isStaticFile =
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.startsWith('/favicon') ||
    pathname.includes('.');

  // Allow static files and API routes
  if (isStaticFile || isApiRoute) {
    return NextResponse.next();
  }

  // Public route - allow access
  if (isPublicRoute) {
    // If logged in and trying to access login/register, redirect to dashboard
    if (isLoggedIn && (pathname === '/login' || pathname === '/register')) {
      return NextResponse.redirect(new URL('/dashboard', nextUrl));
    }
    return NextResponse.next();
  }

  // Not logged in and trying to access protected route
  if (!isLoggedIn && (isAppRoute || isOnboardingRoute)) {
    const callbackUrl = encodeURIComponent(pathname);
    return NextResponse.redirect(
      new URL(`/login?callbackUrl=${callbackUrl}`, nextUrl)
    );
  }

  // Logged in user accessing app routes
  if (isLoggedIn && isAppRoute) {
    // TODO: Check if onboarding is complete
    // For now, allow access to app routes
    return NextResponse.next();
  }

  // Logged in user accessing onboarding routes
  if (isLoggedIn && isOnboardingRoute) {
    // TODO: Check if onboarding is already complete and redirect to dashboard
    return NextResponse.next();
  }

  // Default: allow the request
  return NextResponse.next();
});

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|public).*)',
  ],
};
