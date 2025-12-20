import { createFileRoute } from '@tanstack/react-router';
import { Title, Text } from '@mantine/core';

import { Head } from '@/components/seo/head';

export const Route = createFileRoute('/_authenticated/admin/users')({
  component: UsersPage,
});

function UsersPage() {
  return (
    <>
      <Head title="Users" description="Manage users" />
      <Title order={2} mb="md">
        Users
      </Title>
      <Text c="dimmed">Manage your users here</Text>
    </>
  );
}
