import { createFileRoute } from '@tanstack/react-router';
import { Title, Text } from '@mantine/core';

import { Head } from '@/components/seo/head';

export const Route = createFileRoute('/_authenticated/admin/templates')({
  component: TemplatesPage,
});

function TemplatesPage() {
  return (
    <>
      <Head title="Templates" description="Manage templates" />
      <Title order={2} mb="md">
        Templates
      </Title>
      <Text c="dimmed">Manage your templates here</Text>
    </>
  );
}
