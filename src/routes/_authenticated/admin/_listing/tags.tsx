import { createFileRoute } from '@tanstack/react-router';

import { TagsListPage } from '@/features/tags';

export const Route = createFileRoute('/_authenticated/admin/_listing/tags')({
  component: TagsListPage,
});
