import { useSuspenseQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';

import { Head } from '@/components/seo/head';
import { usePageHeader } from '@/hooks/use-page-header';

import { templateQuery } from '../api/get-template';
import { useUpdateTemplate } from '../api/update-template';
import { TemplateForm } from '../components/template-form';
import type { TemplateFormValues } from '../types';
import { transformFormValuesToParams } from '../utils/transform-form-values';

export interface TemplateEditPageProps {
  id: number;
}

export function TemplateEditPage({ id }: TemplateEditPageProps) {
  const navigate = useNavigate();

  const { data: templateResponse } = useSuspenseQuery(
    templateQuery.getOptions(id)
  );
  const template = templateResponse.data;

  const updateTemplate = useUpdateTemplate();

  usePageHeader({
    title: 'Edit Template',
    dynamicBreadcrumb: template.label,
  });

  const handleSubmit = async (values: TemplateFormValues) => {
    await updateTemplate.mutateAsync({
      id,
      ...transformFormValuesToParams(values),
    });
    void navigate({ to: `/admin/templates/${id}` });
  };

  const backTemplateMode =
    template.side === 'front' && template.backTemplateId == null
      ? 'default'
      : 'custom';

  const initialValues: Partial<TemplateFormValues> = {
    side: template.side,
    name: template.name,
    label: template.label,
    description: template.description ?? '',
    templateTypeId: template.templateTypeId,
    backTemplateId: template.backTemplateId ?? null,
    backTemplateMode,
    isDefaultBack: template.isDefaultBack ?? false,
    isPublished: template.isPublished ?? true,
    tagIds: template.tags.map((tag) => tag.id),
  };

  return (
    <>
      <Head
        title={`Edit ${template.label}`}
        description={`Edit template: ${template.label}`}
      />
      <TemplateForm
        initialValues={initialValues}
        onSubmit={handleSubmit}
        submitLabel="Save Changes"
        onCancel={() => void navigate({ to: `/admin/templates/${id}` })}
      />
    </>
  );
}
