import { createFileRoute } from '@tanstack/react-router';

import { ColorPresetsPage } from '@/features/colors';

export const Route = createFileRoute(
  '/_authenticated/admin/_listing/color-presets'
)({
  component: ColorPresetsPage,
});
