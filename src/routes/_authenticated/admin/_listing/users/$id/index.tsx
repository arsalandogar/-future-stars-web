import { UserViewPage } from '@/features/users/pages/user-view-page';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute(
  '/_authenticated/admin/_listing/users/$id/'
)({
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useParams();

  return <UserViewPage id={Number(id)} />;
}
