import { createFileRoute, stripSearchParams } from '@tanstack/react-router';
import { Title, Text } from '@mantine/core';
import * as v from 'valibot';

import { Head } from '@/components/seo/head';
import { UsersList } from '@/features/users';

const defaultValues = {
  search: '',
};

const usersSearchSchema = v.object({
  page: v.optional(
    v.fallback(v.pipe(v.number(), v.integer(), v.minValue(1)), 1),
    1
  ),
  search: v.optional(v.fallback(v.string(), ''), ''),
});

export const Route = createFileRoute('/_authenticated/admin/users')({
  component: UsersPage,
  validateSearch: usersSearchSchema,
  search: {
    middlewares: [stripSearchParams(defaultValues)],
  },
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
