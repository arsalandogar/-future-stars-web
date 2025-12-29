import { createFileRoute } from '@tanstack/react-router';
import { Title, Text } from '@mantine/core';

import { Head } from '@/components/seo/head';
import { UsersList } from '@/features/users';

export const Route = createFileRoute('/_authenticated/admin/users')({
  component: UsersPage,
});

function UsersPage() {
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
