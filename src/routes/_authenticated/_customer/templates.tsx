import { createFileRoute } from '@tanstack/react-router';

import { TemplatesPage } from '@/features/customer';

export const Route = createFileRoute('/_authenticated/_customer/templates')({
  component: TemplatesPage,
});
