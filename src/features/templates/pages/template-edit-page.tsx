import { Anchor, Breadcrumbs, Card, Loader, Text, Title } from '@mantine/core';
import { Link, useNavigate } from '@tanstack/react-router';

import { Head } from '@/components/seo/head';

import { useTemplate } from '../api/get-template';
import { useUpdateTemplate } from '../api/update-template';
import { TemplateForm } from '../components/template-form';
import type { TemplateFormValues } from '../types';

export interface TemplateEditPageProps {
  id: number;
}

export function TemplateEditPage({ id }: TemplateEditPageProps) {
  const navigate = useNavigate();

  const { data: templateResponse, isLoading } = useTemplate({
    variables: id,
  });
  const template = templateResponse?.data;

  const updateTemplate = useUpdateTemplate();

  const breadcrumbItems = [
    { title: 'Home', href: '/admin' },
    { title: 'Templates', href: '/admin/templates' },
    { title: template?.label ?? 'Edit', href: `/admin/templates/${id}` },
    { title: 'Edit', href: `/admin/templates/${id}/edit` },
  ];

  const handleSubmit = (values: TemplateFormValues) => {
    updateTemplate.mutate(
      {
        id,
        side: values.side,
        name: values.name,
        label: values.label,
        description: values.description || undefined,
        svgString: values.svgString || undefined,
        templateTypeId: values.templateTypeId!,
        backTemplateId: values.backTemplateId,
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
        onSuccess: () => {
          void navigate({ to: `/admin/templates/${id}` });
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader />
      </div>
    );
  }

  if (!template) {
    return (
      <div className="flex justify-center py-8">
        <Text c="dimmed">Template not found</Text>
      </div>
    );
  }

  const initialValues: Partial<TemplateFormValues> = {
    side: template.side,
    name: template.name,
    label: template.label,
    description: template.description ?? '',
    svgString: template.svgString,
    templateTypeId: template.templateTypeId,
    backTemplateId: template.backTemplateId ?? null,
    tagIds: template.tags.map((tag) => String(tag.id)),
    attributes: template.attributes.map((attr) => ({
      type: attr.type,
      name: attr.name,
      label: attr.label,
      defaultValue: attr.defaultValue ?? '',
      defaultColor: attr.defaultColor ?? '',
    })),
  };

  return (
    <>
      <Head
        title={`Edit ${template.label}`}
        description={`Edit template: ${template.label}`}
      />
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <Title order={2}>Edit Template</Title>
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
          <TemplateForm
            initialValues={initialValues}
            onSubmit={handleSubmit}
            submitLabel="Save Changes"
          />
        </Card>
      </div>
    </>
  );
}
