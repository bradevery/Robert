import { QueryClient } from '@tanstack/react-query';
import { cache } from 'react';

const STALE_TIME = 1000 * 60 * 5;

export const queryClientConfig = {
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: STALE_TIME,
    },
  },
};

export const getQueryClient = cache(() => new QueryClient(queryClientConfig));
