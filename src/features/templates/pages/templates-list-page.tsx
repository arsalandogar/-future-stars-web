import { Head } from '@/components/seo/head';

import { TemplatesList } from '../components/templates-list';

export function TemplatesListPage() {
  return (
    <>
      <Head title="Templates" description="Manage templates" />
      <TemplatesList />
    </>
  );
}
