import { Anchor, Breadcrumbs, Card, Title } from '@mantine/core';
import { Link, useNavigate } from '@tanstack/react-router';

import { Head } from '@/components/seo/head';

import { useCreateTemplate } from '../api/create-template';
import { TemplateForm } from '../components/template-form';
import type { TemplateFormValues } from '../types';

const breadcrumbItems = [
  { title: 'Home', href: '/admin' },
  { title: 'Templates', href: '/admin/templates' },
  { title: 'Create', href: '/admin/templates/create' },
];

export function TemplateCreatePage() {
  const navigate = useNavigate();
  const createTemplate = useCreateTemplate();

  const handleSubmit = (values: TemplateFormValues) => {
    createTemplate.mutate(
      {
        side: values.side,
        name: values.name,
        label: values.label,
        description: values.description || undefined,
        svgString: values.svgString || undefined,
        templateTypeId: values.templateTypeId!,
        backTemplateId: values.backTemplateId ?? undefined,
        tagIds: values.tagIds.map((id) => Number(id)),
        attributes: values.attributes.map((attr) => ({
          type: attr.type,
          name: attr.name,
          label: attr.label,
          defaultValue: attr.defaultValue || undefined,
          defaultColor: attr.defaultColor || undefined,
        })),
      },
      {
        onSuccess: (data) => {
          void navigate({ to: `/admin/templates/${data.id}` });
        },
      }
    );
  };

  return (
    <>
      <Head title="Create Template" description="Create a new template" />
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <Title order={2}>Create Template</Title>
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
        <Card withBorder radius="md" p="lg">
          <TemplateForm onSubmit={handleSubmit} submitLabel="Create Template" />
        </Card>
      </div>
    </>
  );
}
