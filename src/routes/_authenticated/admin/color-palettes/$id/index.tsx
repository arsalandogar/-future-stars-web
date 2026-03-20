import { createFileRoute } from '@tanstack/react-router';

import { ColorPaletteDetailPage } from '@/features/color-palettes';

export const Route = createFileRoute(
  '/_authenticated/admin/color-palettes/$id/'
)({
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useParams();

  return <ColorPaletteDetailPage id={Number(id)} />;
}
