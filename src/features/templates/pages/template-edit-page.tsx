import { Card, Loader, Text } from '@mantine/core';
import { useNavigate } from '@tanstack/react-router';

import { Head } from '@/components/seo/head';
import { usePageHeader } from '@/hooks/use-page-header';

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

  usePageHeader({
    title: 'Edit Template',
    dynamicBreadcrumb: template?.label,
  });

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
      <Card withBorder radius="md" p="lg">
        <TemplateForm
          initialValues={initialValues}
          onSubmit={handleSubmit}
          submitLabel="Save Changes"
        />
      </Card>
    </>
  );
}
