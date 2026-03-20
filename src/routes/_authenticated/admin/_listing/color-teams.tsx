import { createFileRoute } from '@tanstack/react-router';

import { ColorTeamsListPage } from '@/features/colors';

export const Route = createFileRoute(
  '/_authenticated/admin/_listing/color-teams'
)({
  component: ColorTeamsListPage,
});
