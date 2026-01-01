import {
  createFileRoute,
  Link,
  stripSearchParams,
} from '@tanstack/react-router';
import { Anchor, Breadcrumbs, Title } from '@mantine/core';
import * as v from 'valibot';

import { Head } from '@/components/seo/head';
import { TemplatesList } from '@/features/templates';

const defaultValues = {
  search: '',
};

const templatesSearchSchema = v.object({
  page: v.optional(
    v.fallback(v.pipe(v.number(), v.integer(), v.minValue(1)), 1),
    1
  ),
  limit: v.optional(
    v.fallback(
      v.pipe(v.number(), v.integer(), v.picklist([10, 25, 50, 100])),
      10
    ),
    10
  ),
  search: v.optional(v.fallback(v.string(), ''), ''),
});

export const Route = createFileRoute('/_authenticated/admin/templates')({
  component: TemplatesPage,
  validateSearch: templatesSearchSchema,
  search: {
    middlewares: [stripSearchParams(defaultValues)],
  },
});

function TemplatesPage() {
  const breadcrumbItems = [
    { title: 'Home', href: '/admin' },
    { title: 'Templates', href: '/admin/templates' },
  ];

  return (
    <>
      <Head title="Templates" description="Manage templates" />
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <Title order={2}>Templates</Title>
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
        <TemplatesList />
      </div>
    </>
  );
}
