import { createFileRoute } from '@tanstack/react-router';

import { CardPage, useCard } from '@/features/card-builder';

export const Route = createFileRoute('/_authenticated/_customer/card/$cardId')({
  loader: ({ context: { queryClient }, params: { cardId } }) =>
    queryClient.ensureQueryData(useCard.getOptions(Number(cardId))),
  component: RouteComponent,
});

function RouteComponent() {
  const { cardId } = Route.useParams();
  return <CardPage cardId={Number(cardId)} />;
}
