import { createFileRoute, stripSearchParams } from '@tanstack/react-router';
import * as v from 'valibot';

import { LegalListPage } from '@/features/legal';

const defaultValues = {
  search: '',
};

const legalSearchSchema = v.object({
  page: v.optional(
    v.fallback(v.pipe(v.number(), v.integer(), v.minValue(1)), 1),
    1
  ),
  status: v.optional(v.picklist(['draft', 'published'])),
  search: v.optional(v.fallback(v.string(), ''), ''),
});

export const Route = createFileRoute('/_authenticated/admin/legal/$type/')({
  component: RouteComponent,
  validateSearch: legalSearchSchema,
  search: {
    middlewares: [stripSearchParams(defaultValues)],
  },
});

function RouteComponent() {
  const { type } = Route.useParams();
  const searchParams = Route.useSearch();

  return <LegalListPage type={type} searchParams={searchParams} />;
}
