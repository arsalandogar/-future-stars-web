import { createFileRoute } from '@tanstack/react-router';
import { Title, Text } from '@mantine/core';

import { Head } from '@/components/seo/head';

export const Route = createFileRoute('/_authenticated/admin/tasks')({
  component: TasksPage,
});

function TasksPage() {
  return (
    <>
      <Head title="Tasks" description="Manage tasks" />
      <Title order={2} mb="md">
        Tasks
      </Title>
      <Text c="dimmed">Manage your tasks here</Text>
    </>
  );
}
