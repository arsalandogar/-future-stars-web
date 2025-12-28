import { createFileRoute, Link } from '@tanstack/react-router';
import { Anchor, Breadcrumbs, Title } from '@mantine/core';

import { Head } from '@/components/seo/head';
import { OrdersList } from '@/features/orders';

export const Route = createFileRoute('/_authenticated/admin/orders')({
  component: OrdersPage,
});

function OrdersPage() {
  const breadcrumbItems = [
    { title: 'Home', href: '/admin' },
    { title: 'Orders', href: '/admin/orders' },
  ];

  return (
    <>
      <Head title="Orders" description="Manage orders" />
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <Title order={2}>Orders</Title>
          <Breadcrumbs>
            {breadcrumbItems.map((item, index) => (
              <Anchor
                key={item.href}
                component={Link}
                to={item.href}
                c={index === breadcrumbItems.length - 1 ? undefined : 'dimmed'}
                size="sm"
              >
                {item.title}
              </Anchor>
            ))}
          </Breadcrumbs>
        </div>
        <OrdersList />
      </div>
    </>
  );
}
