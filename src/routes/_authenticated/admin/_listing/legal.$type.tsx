import { createFileRoute, stripSearchParams } from '@tanstack/react-router';
import * as v from 'valibot';

import { LegalDocumentList } from '@/features/legal';

const defaultValues = {
  status: undefined,
};

const legalSearchSchema = v.object({
  status: v.optional(v.picklist(['draft', 'published'])),
});

export const Route = createFileRoute(
  '/_authenticated/admin/_listing/legal/$type'
)({
  validateSearch: legalSearchSchema,
  search: {
    middlewares: [stripSearchParams(defaultValues)],
  },
  component: LegalDocumentList,
});
