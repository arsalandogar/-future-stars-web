import { createFileRoute } from '@tanstack/react-router';

import { LegalEditPage } from '@/features/legal';

export const Route = createFileRoute(
  '/_authenticated/admin/legal/$type/$id/edit'
)({
  component: RouteComponent,
});

function RouteComponent() {
  const { type, id } = Route.useParams();

  return <LegalEditPage type={type} id={Number(id)} />;
}
