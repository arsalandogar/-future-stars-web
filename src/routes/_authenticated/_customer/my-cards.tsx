import { createFileRoute } from '@tanstack/react-router';

import { MyCardsPage } from '@/features/customer';

export const Route = createFileRoute('/_authenticated/_customer/my-cards')({
  component: MyCardsPage,
});
