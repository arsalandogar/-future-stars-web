import { createFileRoute } from '@tanstack/react-router';

import { ColorLeaguesPage } from '@/features/colors';

export const Route = createFileRoute(
  '/_authenticated/admin/_listing/color-leagues'
)({
  component: ColorLeaguesPage,
});
