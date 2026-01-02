import { createFileRoute, stripSearchParams } from '@tanstack/react-router';
import * as v from 'valibot';

import { TemplatesListPage } from '@/features/templates';

const defaultValues = {
  search: '',
};

const templatesSearchSchema = v.object({
  page: v.optional(
    v.fallback(v.pipe(v.number(), v.integer(), v.minValue(1)), 1),
    1
  ),
  limit: v.optional(
    v.fallback(
      v.pipe(v.number(), v.integer(), v.picklist([10, 25, 50, 100])),
      10
    ),
    10
  ),
  search: v.optional(v.fallback(v.string(), ''), ''),
});

export const Route = createFileRoute('/_authenticated/admin/templates')({
  component: TemplatesListPage,
  validateSearch: templatesSearchSchema,
  search: {
    middlewares: [stripSearchParams(defaultValues)],
  },
});
