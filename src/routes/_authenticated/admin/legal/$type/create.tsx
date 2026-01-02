import { createFileRoute } from '@tanstack/react-router';

import { LegalCreatePage } from '@/features/legal';

export const Route = createFileRoute(
  '/_authenticated/admin/legal/$type/create'
)({
  component: RouteComponent,
});

function RouteComponent() {
  const { type } = Route.useParams();

  return <LegalCreatePage type={type} />;
}
