import { Head } from '@/components/seo/head';

import { TemplateTypesList } from '../components/template-types-list';

export function TemplateTypesListPage() {
  return (
    <>
      <Head title="Template Types" description="Manage template types" />
      <TemplateTypesList />
    </>
  );
}
