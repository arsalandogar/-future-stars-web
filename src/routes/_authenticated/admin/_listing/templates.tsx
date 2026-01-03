import { createFileRoute, stripSearchParams } from '@tanstack/react-router';
import * as v from 'valibot';

import { TemplatesListPage } from '@/features/templates';

const defaultValues = {
  side: 'front' as const,
};

const templatesSearchSchema = v.object({
  side: v.optional(v.fallback(v.picklist(['front', 'back']), 'front'), 'front'),
});

export const Route = createFileRoute(
  '/_authenticated/admin/_listing/templates'
)({
  validateSearch: templatesSearchSchema,
  search: {
    middlewares: [stripSearchParams(defaultValues)],
  },
  component: TemplatesListPage,
});
