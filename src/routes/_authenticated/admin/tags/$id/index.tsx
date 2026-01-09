import { createFileRoute } from '@tanstack/react-router';

import { TagViewPage } from '@/features/tags';

export const Route = createFileRoute('/_authenticated/admin/tags/$id/')({
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useParams();

  return <TagViewPage id={Number(id)} />;
}
