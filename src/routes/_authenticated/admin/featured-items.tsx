import { createFileRoute, stripSearchParams } from '@tanstack/react-router';
import * as v from 'valibot';

import { FeaturedItemsListPage } from '@/features/featured-items';

const defaultValues = {
  search: '',
};

const featuredItemsSearchSchema = v.object({
  search: v.optional(v.fallback(v.string(), ''), ''),
});

export const Route = createFileRoute('/_authenticated/admin/featured-items')({
  component: FeaturedItemsListPage,
  validateSearch: featuredItemsSearchSchema,
  search: {
    middlewares: [stripSearchParams(defaultValues)],
  },
});
