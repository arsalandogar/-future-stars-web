import { createFileRoute } from '@tanstack/react-router';
import * as v from 'valibot';

import { SharedLinkPage } from '@/features/shared-links';

const searchSchema = v.object({
  mode: v.optional(v.picklist(['web'])),
});

export const Route = createFileRoute('/shared/$code')({
  validateSearch: searchSchema,
  component: RouteComponent,
});

function RouteComponent() {
  const { code } = Route.useParams();
  const { mode } = Route.useSearch();

  return (
    <SharedLinkPage code={code} initialMode={mode === 'web' ? 'web' : 'gate'} />
  );
}
