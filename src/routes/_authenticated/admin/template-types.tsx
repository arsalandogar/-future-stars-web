import { createFileRoute } from '@tanstack/react-router';
import { Title } from '@mantine/core';

import { Head } from '@/components/seo/head';
import { TemplateTypesList } from '@/features/template-types';

export const Route = createFileRoute('/_authenticated/admin/template-types')({
  component: TemplateTypesPage,
});

function TemplateTypesPage() {
  return (
    <>
      <Head title="Template Types" description="Manage template types" />
      <Title order={2} mb="md">
        Template Types
      </Title>
      <TemplateTypesList />
    </>
  );
}
