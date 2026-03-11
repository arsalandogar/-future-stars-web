import { createFileRoute } from '@tanstack/react-router';

import { CardPage, cardQuery } from '@/features/card-builder';

export const Route = createFileRoute('/_authenticated/_customer/card/$cardId')({
  loader: ({ context: { queryClient }, params: { cardId } }) =>
    queryClient.ensureQueryData(cardQuery.getOptions(Number(cardId))),
  component: RouteComponent,
});

function RouteComponent() {
  const { cardId } = Route.useParams();
  return <CardPage cardId={Number(cardId)} />;
}
