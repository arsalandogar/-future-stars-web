import { createFileRoute } from '@tanstack/react-router';

import { TagViewPage, useTag } from '@/features/tags';

export const Route = createFileRoute('/_authenticated/admin/tags/$id/')({
  loader: ({ context: { queryClient }, params: { id } }) =>
    queryClient.ensureQueryData(useTag.getOptions(Number(id))),
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useParams();

  return <TagViewPage id={Number(id)} />;
}
