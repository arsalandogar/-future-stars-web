import { createFileRoute } from '@tanstack/react-router';
import { Title, Text } from '@mantine/core';

import { Head } from '@/components/seo/head';

export const Route = createFileRoute('/_authenticated/admin/customers')({
  component: CustomersPage,
});

function CustomersPage() {
  return (
    <>
      <Head title="Customers" description="Manage customers" />
      <Title order={2} mb="md">
        Customers
      </Title>
      <Text c="dimmed">Manage your customers here</Text>
    </>
  );
}
