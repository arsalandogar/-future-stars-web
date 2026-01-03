import { createFileRoute } from '@tanstack/react-router';

import { TemplateCreatePage } from '@/features/templates';

export const Route = createFileRoute('/_authenticated/admin/templates/create')({
  component: TemplateCreatePage,
});
