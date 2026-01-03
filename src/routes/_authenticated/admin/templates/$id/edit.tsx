import { createFileRoute } from '@tanstack/react-router';

import { TemplateEditPage } from '@/features/templates';

export const Route = createFileRoute(
  '/_authenticated/admin/templates/$id/edit'
)({
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useParams();

  return <TemplateEditPage id={Number(id)} />;
}
