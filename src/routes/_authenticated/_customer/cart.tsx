import { createFileRoute } from '@tanstack/react-router';

import { CartPage } from '@/features/customer';

export const Route = createFileRoute('/_authenticated/_customer/cart')({
  component: CartPage,
});
