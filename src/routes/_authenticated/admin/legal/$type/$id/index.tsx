import { createFileRoute } from '@tanstack/react-router';

import { LegalViewPage } from '@/features/legal';

export const Route = createFileRoute('/_authenticated/admin/legal/$type/$id/')({
  component: RouteComponent,
});

function RouteComponent() {
  const { type, id } = Route.useParams();

  return <LegalViewPage type={type} id={Number(id)} />;
}
