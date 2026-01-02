import { Anchor, Breadcrumbs, Title } from '@mantine/core';
import { Link } from '@tanstack/react-router';

import { Head } from '@/components/seo/head';

import { FeaturedItemsList } from '../components/featured-items-list';

const breadcrumbItems = [
  { title: 'Home', href: '/admin' },
  { title: 'Featured Items', href: '/admin/featured-items' },
];

export function FeaturedItemsListPage() {
  return (
    <>
      <Head title="Featured Items" description="Manage Featured Items" />
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <Title order={2}>Featured Items</Title>
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
        <FeaturedItemsList />
      </div>
    </>
  );
}
