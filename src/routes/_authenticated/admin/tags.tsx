import { Head } from '@/components/seo/head';
import { TagsList } from '@/features/tags';
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

const tagsSearchSchema = v.object({
  search: v.optional(v.fallback(v.string(), ''), ''),
});

export const Route = createFileRoute('/_authenticated/admin/tags')({
  component: TagsPage,
  validateSearch: tagsSearchSchema,
  search: {
    middlewares: [stripSearchParams(defaultValues)],
  },
});

function TagsPage() {
  const breadcrumbItems = [
    { title: 'Home', href: '/admin' },
    { title: 'Tags', href: '/admin/tags' },
  ];
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
