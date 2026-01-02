import { Title } from '@mantine/core';

import { Head } from '@/components/seo/head';

import { ConfigsList } from '../components/configs-list';

export function ConfigsListPage() {
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
