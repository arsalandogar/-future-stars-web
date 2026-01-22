import { createFileRoute } from '@tanstack/react-router';

import { CheckoutPage } from '@/features/customer';

export const Route = createFileRoute('/_authenticated/_checkout/checkout')({
  component: CheckoutPage,
});
