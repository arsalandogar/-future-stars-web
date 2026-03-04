import { createFileRoute } from '@tanstack/react-router';
import * as v from 'valibot';

import { MyCardsPage, useUserCards, useUserPacks } from '@/features/customer';
import { DEFAULT_PAGE, DEFAULT_PAGE_LIMIT } from '@/lib/react-query';

const searchSchema = v.object({
  tab: v.optional(v.picklist(['cards', 'packs']), 'cards'),
});

export const Route = createFileRoute('/_authenticated/_customer/my-cards')({
  validateSearch: searchSchema,
  loaderDeps: ({ search: { tab } }) => ({ tab }),
  loader: ({ context: { queryClient }, deps: { tab } }) => {
    if (tab === 'packs') {
      void queryClient.prefetchInfiniteQuery({
        ...useUserPacks.getOptions({
          page: DEFAULT_PAGE,
          limit: DEFAULT_PAGE_LIMIT,
        }),
        pages: 1,
      });
    } else {
      void queryClient.prefetchInfiniteQuery({
        ...useUserCards.getOptions({
          page: DEFAULT_PAGE,
          limit: DEFAULT_PAGE_LIMIT,
        }),
        pages: 1,
      });
    }
  },
  component: MyCardsPage,
});
