import { createFileRoute } from '@tanstack/react-router';
import * as v from 'valibot';

import { MyCardsPage } from '@/features/customer';

const searchSchema = v.object({
  tab: v.optional(v.picklist(['cards', 'packs']), 'cards'),
});

export const Route = createFileRoute('/_authenticated/_customer/my-cards')({
  component: MyCardsPage,
  validateSearch: searchSchema,
});
