import { createFileRoute } from '@tanstack/react-router';

import { TemplateTypesListPage } from '@/features/template-types';

export const Route = createFileRoute('/_authenticated/admin/template-types')({
  component: TemplateTypesListPage,
});
