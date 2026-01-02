import { createFileRoute, stripSearchParams } from '@tanstack/react-router';
import * as v from 'valibot';

import { UsersListPage } from '@/features/users';

const defaultValues = {
  search: '',
};

const usersSearchSchema = v.object({
  page: v.optional(
    v.fallback(v.pipe(v.number(), v.integer(), v.minValue(1)), 1),
    1
  ),
  search: v.optional(v.fallback(v.string(), ''), ''),
});

export const Route = createFileRoute('/_authenticated/admin/users')({
  component: UsersListPage,
  validateSearch: usersSearchSchema,
  search: {
    middlewares: [stripSearchParams(defaultValues)],
  },
});
