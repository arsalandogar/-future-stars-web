import { Title } from '@mantine/core';

import { Head } from '@/components/seo/head';

import { TemplateTypesList } from '../components/template-types-list';

export function TemplateTypesListPage() {
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
