import { createFileRoute } from '@tanstack/react-router';

import { CustomerLayout } from '@/app/layouts/customer';
import { NotFound } from '@/components/errors/not-found';

export const Route = createFileRoute('/_authenticated/_customer')({
  component: CustomerLayout,
  notFoundComponent: NotFound,
});
