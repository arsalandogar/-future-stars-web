import { Anchor, Breadcrumbs, Title } from '@mantine/core';
import { Link } from '@tanstack/react-router';

import { Head } from '@/components/seo/head';

import { OrdersList } from '../components/orders-list';

const breadcrumbItems = [
  { title: 'Home', href: '/admin' },
  { title: 'Orders', href: '/admin/orders' },
];

export function OrdersListPage() {
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
