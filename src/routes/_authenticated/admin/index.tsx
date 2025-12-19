import { createFileRoute } from '@tanstack/react-router';
import { Center, Stack, Text, Title } from '@mantine/core';
import { Head } from '@/components/seo/head';

export const Route = createFileRoute('/_authenticated/admin/')({
  component: AdminDashboard,
});

function AdminDashboard() {
  return (
    <>
      <Head title="Admin Dashboard" description="Admin dashboard" />
      <Center h="100vh" w="100vw">
        <Stack align="center" gap="lg">
          <Title order={1}>Admin Dashboard</Title>
          <Text size="xl" c="dimmed">
            Welcome to the admin area
          </Text>
        </Stack>
      </Center>
    </>
  );
}
