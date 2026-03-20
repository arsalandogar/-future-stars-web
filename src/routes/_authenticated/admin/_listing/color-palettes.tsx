import { createFileRoute } from '@tanstack/react-router';

import { ColorPalettesListPage } from '@/features/color-palettes';

export const Route = createFileRoute(
  '/_authenticated/admin/_listing/color-palettes'
)({
  component: ColorPalettesListPage,
});
