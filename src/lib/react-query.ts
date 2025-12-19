import type { DefaultOptions } from '@tanstack/react-query';

export {
  createQuery,
  createInfiniteQuery,
  createMutation,
  createSuspenseQuery,
  createSuspenseInfiniteQuery,
} from 'react-query-kit';
export type { inferData, inferVariables } from 'react-query-kit';

export const queryConfig = {
  queries: {
    refetchOnWindowFocus: false,
    retry: false,
    staleTime: 1000 * 60,
  },
} satisfies DefaultOptions;
