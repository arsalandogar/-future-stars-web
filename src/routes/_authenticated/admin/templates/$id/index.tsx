import { createFileRoute } from '@tanstack/react-router';

import { TemplateViewPage } from '@/features/templates';

export const Route = createFileRoute('/_authenticated/admin/templates/$id/')({
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useParams();

  return <TemplateViewPage id={Number(id)} />;
}
