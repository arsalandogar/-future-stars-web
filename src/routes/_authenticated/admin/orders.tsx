import { createFileRoute } from '@tanstack/react-router';
import { Title, Text } from '@mantine/core';

import { Head } from '@/components/seo/head';

export const Route = createFileRoute('/_authenticated/admin/orders')({
  component: OrdersPage,
});

function OrdersPage() {
  return (
    <>
      <Head title="Orders" description="Manage orders" />
      <Title order={2} mb="md">
        Orders
      </Title>
      <Text c="dimmed">Manage your orders here</Text>
    </>
  );
}
