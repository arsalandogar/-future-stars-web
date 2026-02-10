import { createFileRoute, redirect } from '@tanstack/react-router';
import * as v from 'valibot';

import { AccountPage } from '@/features/customer';

const searchSchema = v.object({
  section: v.optional(
    v.picklist([
      'account-details',
      'payment-methods',
      'addresses',
      'orders',
      'privacy-policy',
    ]),
    'account-details'
  ),
});

export const Route = createFileRoute('/_authenticated/_customer/account')({
  validateSearch: searchSchema,
  beforeLoad: ({ context }) => {
    if (context.auth.user?.isGuest) {
      // eslint-disable-next-line @typescript-eslint/only-throw-error
      throw redirect({ to: '/login' });
    }
  },
  component: AccountPage,
});
