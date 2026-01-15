import { createFileRoute, stripSearchParams } from '@tanstack/react-router';
import * as v from 'valibot';

import { TemplatesBrowsePage } from '@/features/templates-browse';

const defaultValues = { category: undefined as string | undefined };

const searchSchema = v.object({
  category: v.optional(v.string()),
});

export const Route = createFileRoute('/_authenticated/_customer/templates')({
  validateSearch: searchSchema,
  search: { middlewares: [stripSearchParams(defaultValues)] },
  component: TemplatesBrowsePage,
});
