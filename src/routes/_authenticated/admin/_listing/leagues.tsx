import { createFileRoute } from '@tanstack/react-router';

import { LeaguesListPage } from '@/features/colors';

export const Route = createFileRoute('/_authenticated/admin/_listing/leagues')({
  component: LeaguesListPage,
});
