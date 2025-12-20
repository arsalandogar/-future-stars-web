import { createFileRoute } from '@tanstack/react-router';
import { Title, Text } from '@mantine/core';

import { Head } from '@/components/seo/head';

export const Route = createFileRoute('/_authenticated/admin/settings')({
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <>
      <Head title="Settings" description="Admin settings" />
      <Title order={2} mb="md">
        Settings
      </Title>
      <Text c="dimmed">Manage admin settings here</Text>
    </>
  );
}
