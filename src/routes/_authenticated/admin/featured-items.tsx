import { Head } from '@/components/seo/head';
import { FeaturedItemsList } from '@/features/featured-items';
import { Anchor, Breadcrumbs, Title } from '@mantine/core';
import {
  createFileRoute,
  Link,
  stripSearchParams,
} from '@tanstack/react-router';
import * as v from 'valibot';

const defaultValues = {
  search: '',
};

const featuredItemsSearchSchema = v.object({
  search: v.optional(v.fallback(v.string(), ''), ''),
});

export const Route = createFileRoute('/_authenticated/admin/featured-items')({
  component: FeaturedItemsPage,
  validateSearch: featuredItemsSearchSchema,
  search: {
    middlewares: [stripSearchParams(defaultValues)],
  },
});

function FeaturedItemsPage() {
  const breadcrumbItems = [
    { title: 'Home', href: '/admin' },
    { title: 'Featured Items', href: '/admin/featured-items' },
  ];
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
