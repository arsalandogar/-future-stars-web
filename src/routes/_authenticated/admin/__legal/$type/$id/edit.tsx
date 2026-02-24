import { createFileRoute } from '@tanstack/react-router';

import { LegalEditPage, useLegalDocument } from '@/features/legal';

export const Route = createFileRoute(
  '/_authenticated/admin/__legal/$type/$id/edit'
)({
  loader: ({ context: { queryClient }, params: { id } }) =>
    queryClient.ensureQueryData(useLegalDocument.getOptions(Number(id))),
  component: RouteComponent,
});

function RouteComponent() {
  const { type, id } = Route.useParams();

  return <LegalEditPage type={type} id={Number(id)} />;
}
