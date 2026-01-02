import { createFileRoute } from '@tanstack/react-router';

import { LegalVersionsPage } from '@/features/legal';

export const Route = createFileRoute(
  '/_authenticated/admin/legal/$type/versions'
)({
  component: RouteComponent,
});

function RouteComponent() {
  const { type } = Route.useParams();

  return <LegalVersionsPage type={type} />;
}
