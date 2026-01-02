import { Anchor, Breadcrumbs, Title } from '@mantine/core';
import { Link } from '@tanstack/react-router';

import { Head } from '@/components/seo/head';

import { TagsList } from '../components/tags-list';

const breadcrumbItems = [
  { title: 'Home', href: '/admin' },
  { title: 'Tags', href: '/admin/tags' },
];

export function TagsListPage() {
  return (
    <>
      <Head title="Tags" description="Manage Tags" />
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <Title order={2}>Tags</Title>
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
        <TagsList />
      </div>
    </>
  );
}
