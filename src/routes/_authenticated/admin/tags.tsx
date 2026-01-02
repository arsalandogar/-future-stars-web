import { createFileRoute, stripSearchParams } from '@tanstack/react-router';
import * as v from 'valibot';

import { TagsListPage } from '@/features/tags';

const defaultValues = {
  search: '',
};

const tagsSearchSchema = v.object({
  search: v.optional(v.fallback(v.string(), ''), ''),
});

export const Route = createFileRoute('/_authenticated/admin/tags')({
  component: TagsListPage,
  validateSearch: tagsSearchSchema,
  search: {
    middlewares: [stripSearchParams(defaultValues)],
  },
});
