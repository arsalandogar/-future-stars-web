import { createFileRoute } from '@tanstack/react-router';
import { Title } from '@mantine/core';

import { Head } from '@/components/seo/head';
import { ConfigsList } from '@/features/configs';

export const Route = createFileRoute('/_authenticated/admin/configs')({
  component: ConfigsPage,
});

function ConfigsPage() {
  return (
    <>
      <Head title="Configs" description="Application configuration" />
      <Title order={2} mb="md">
        Configs
      </Title>
      <ConfigsList />
    </>
  );
}
