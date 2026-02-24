import { createFileRoute } from '@tanstack/react-router';
import * as v from 'valibot';

import {
  MyCardsPage,
  USER_CARDS_DEFAULT_LIMIT,
  USER_CARDS_INITIAL_PAGE,
  USER_PACKS_DEFAULT_LIMIT,
  USER_PACKS_INITIAL_PAGE,
  useUserCards,
  useUserPacks,
} from '@/features/customer';

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
          page: USER_PACKS_INITIAL_PAGE,
          limit: USER_PACKS_DEFAULT_LIMIT,
        }),
        pages: 1,
      });
    } else {
      void queryClient.prefetchInfiniteQuery({
        ...useUserCards.getOptions({
          page: USER_CARDS_INITIAL_PAGE,
          limit: USER_CARDS_DEFAULT_LIMIT,
        }),
        pages: 1,
      });
    }
  },
  component: MyCardsPage,
});
