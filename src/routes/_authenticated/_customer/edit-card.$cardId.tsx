import { createFileRoute } from '@tanstack/react-router';

import { EditCardPage } from '@/features/card-builder';

export const Route = createFileRoute(
  '/_authenticated/_customer/edit-card/$cardId'
)({
  component: RouteComponent,
});

function RouteComponent() {
  const { cardId } = Route.useParams();
  return <EditCardPage cardId={Number(cardId)} />;
}
