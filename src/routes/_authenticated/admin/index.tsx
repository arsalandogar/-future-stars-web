import { createFileRoute } from '@tanstack/react-router';
import { Title, Text } from '@mantine/core';

import { Head } from '@/components/seo/head';

export const Route = createFileRoute('/_authenticated/admin/')({
  component: AdminDashboard,
});

function AdminDashboard() {
  return (
    <>
      <Head title="Admin Dashboard" description="Admin dashboard" />
      <Title order={2} mb="md">
        Dashboard
      </Title>
      <Text c="dimmed">Welcome to the admin area</Text>
    </>
  );
}
