import { createFileRoute } from '@tanstack/react-router';

import { TemplateEditPage, useTemplate } from '@/features/templates';

export const Route = createFileRoute(
  '/_authenticated/admin/templates/$id/edit'
)({
  loader: ({ context: { queryClient }, params: { id } }) =>
    queryClient.ensureQueryData(useTemplate.getOptions(Number(id))),
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useParams();

  return <TemplateEditPage id={Number(id)} />;
}
