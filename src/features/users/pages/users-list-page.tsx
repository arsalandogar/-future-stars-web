import { Head } from '@/components/seo/head';

import { UsersList } from '../components/users-list';

export function UsersListPage() {
  return (
    <>
      <Head title="Users" description="Manage users" />
      <UsersList />
    </>
  );
}
