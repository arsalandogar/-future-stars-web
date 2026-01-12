import { createFileRoute } from '@tanstack/react-router';

import { AccountPage } from '@/features/customer';

export const Route = createFileRoute('/_authenticated/_customer/account')({
  component: AccountPage,
});
