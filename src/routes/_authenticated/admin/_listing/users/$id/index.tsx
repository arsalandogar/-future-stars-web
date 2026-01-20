import { UserViewPage } from '@/features/users/pages/user-view-page';
import { createFileRoute, stripSearchParams } from '@tanstack/react-router';
import * as v from 'valibot';

const defaultValues = {
  tab: 'orders' as const,
};

const usersSearchSchema = v.object({
  tab: v.optional(
    v.fallback(
      v.picklist(['orders', 'cards', 'packs', 'cartItems', 'addresses']),
      'orders'
    ),
    'orders'
  ),
});

export const Route = createFileRoute(
  '/_authenticated/admin/_listing/users/$id/'
)({
  validateSearch: usersSearchSchema,
  search: {
    middlewares: [stripSearchParams(defaultValues)],
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useParams();

  return <UserViewPage id={Number(id)} />;
}
