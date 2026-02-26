import { createFileRoute } from '@tanstack/react-router';

import { LegalViewPage, legalDocumentQuery } from '@/features/legal';

export const Route = createFileRoute(
  '/_authenticated/admin/__legal/$type/$id/'
)({
  loader: ({ context: { queryClient }, params: { id } }) =>
    queryClient.ensureQueryData(legalDocumentQuery.getOptions(Number(id))),
  component: RouteComponent,
});

function RouteComponent() {
  const { type, id } = Route.useParams();

  return <LegalViewPage type={type} id={Number(id)} />;
}
