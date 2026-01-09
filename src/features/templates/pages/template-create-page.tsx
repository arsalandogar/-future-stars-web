import { Card } from '@mantine/core';
import { useNavigate } from '@tanstack/react-router';

import { Head } from '@/components/seo/head';
import { usePageHeader } from '@/hooks/use-page-header';

import { useCreateTemplate } from '../api/create-template';
import { TemplateForm } from '../components/template-form';
import type { TemplateFormValues } from '../types';
import { transformFormValuesToParams } from '../utils/transform-form-values';

export function TemplateCreatePage() {
  const navigate = useNavigate();
  const createTemplate = useCreateTemplate();

  usePageHeader({
    title: 'Create Template',
  });

  const handleSubmit = async (values: TemplateFormValues) => {
    const data = await createTemplate.mutateAsync(
      transformFormValuesToParams(values)
    );
    void navigate({ to: `/admin/templates/${data.id}` });
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
