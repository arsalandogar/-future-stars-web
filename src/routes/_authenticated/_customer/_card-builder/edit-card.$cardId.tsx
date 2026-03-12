import { createFileRoute } from '@tanstack/react-router';

import {
  cardQuery,
  EditCardPage,
  prefetchCardBuilderTemplates,
} from '@/features/card-builder';

export const Route = createFileRoute(
  '/_authenticated/_customer/_card-builder/edit-card/$cardId'
)({
  loader: async ({ context: { queryClient }, params: { cardId } }) => {
    const card = await queryClient.ensureQueryData(
      cardQuery.getOptions(Number(cardId))
    );

    prefetchCardBuilderTemplates(queryClient, {
      templateId: card.templateId,
      backTemplateId: card.backTemplateId,
    });
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { cardId } = Route.useParams();
  return <EditCardPage cardId={Number(cardId)} />;
}
