import { createFileRoute } from '@tanstack/react-router';

import { UsersListPage } from '@/features/users';

export const Route = createFileRoute('/_authenticated/admin/_listing/users')({
  component: UsersListPage,
});
