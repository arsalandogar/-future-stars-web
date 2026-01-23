import { createFileRoute } from '@tanstack/react-router';

import { CheckoutLayout } from '@/app/layouts/checkout';
import { NotFound } from '@/components/errors/not-found';

export const Route = createFileRoute('/_authenticated/_checkout')({
  component: CheckoutLayout,
  notFoundComponent: NotFound,
});
