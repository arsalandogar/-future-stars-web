import { Text, Title } from '@mantine/core';

import { Head } from '@/components/seo/head';

import { UsersList } from '../components/users-list';

export function UsersListPage() {
  return (
    <>
      <Head title="Users" description="Manage users" />
      <div className="flex flex-col gap-6">
        <div>
          <Title order={2}>Users</Title>
          <Text c="dimmed">Manage and view registered users</Text>
        </div>
        <UsersList />
      </div>
    </>
  );
}
