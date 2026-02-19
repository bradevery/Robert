'use client';

import posthog from 'posthog-js';
import { PostHogProvider as PHProvider } from 'posthog-js/react';
import { ReactNode, useEffect } from 'react';

interface PostHogProviderProps {
  children: ReactNode;
}

export function PostHogProvider({ children }: PostHogProviderProps) {
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
      persistence: 'localStorage+cookie',
      session_recording: {
        maskAllInputs: false,
        maskInputOptions: {
          password: true,
          email: false,
        },
      },
      api_host: '/ingest',
      person_profiles: 'always',
      ui_host: 'https://eu.posthog.com',
      defaults: '2025-05-24',
      capture_exceptions: true,
      capture_performance: true,
      debug: process.env.NODE_ENV === 'development',
      bootstrap: {},
    });
  }, []);

  return <PHProvider client={posthog}>{children}</PHProvider>;
}
