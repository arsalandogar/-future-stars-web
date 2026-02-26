import { createFileRoute } from '@tanstack/react-router';

import { LegalEditPage, legalDocumentQuery } from '@/features/legal';

export const Route = createFileRoute(
  '/_authenticated/admin/__legal/$type/$id/edit'
)({
  loader: ({ context: { queryClient }, params: { id } }) =>
    queryClient.ensureQueryData(legalDocumentQuery.getOptions(Number(id))),
  component: RouteComponent,
});

function RouteComponent() {
  const { type, id } = Route.useParams();

  return <LegalEditPage type={type} id={Number(id)} />;
}
