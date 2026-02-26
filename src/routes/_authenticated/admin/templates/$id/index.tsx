import { createFileRoute } from '@tanstack/react-router';

import { TemplateViewPage, templateQuery } from '@/features/templates';

export const Route = createFileRoute('/_authenticated/admin/templates/$id/')({
  loader: ({ context: { queryClient }, params: { id } }) =>
    queryClient.ensureQueryData(templateQuery.getOptions(Number(id))),
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useParams();

  return <TemplateViewPage id={Number(id)} />;
}
