import { Card } from '@mantine/core';
import { useNavigate } from '@tanstack/react-router';

import { Head } from '@/components/seo/head';
import { usePageHeader } from '@/hooks/use-page-header';

import { useCreateTemplate } from '../api/create-template';
import { TemplateForm } from '../components/template-form';
import type { TemplateFormValues } from '../types';

export function TemplateCreatePage() {
  const navigate = useNavigate();
  const createTemplate = useCreateTemplate();

  usePageHeader({
    title: 'Create Template',
  });

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
      <Card withBorder radius="md" p="lg">
        <TemplateForm onSubmit={handleSubmit} submitLabel="Create Template" />
      </Card>
    </>
  );
}
