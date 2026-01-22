import { createFileRoute } from '@tanstack/react-router';
import * as v from 'valibot';

import { AccountPage } from '@/features/customer';

const searchSchema = v.object({
  section: v.optional(
    v.picklist(['account-details', 'payment-methods', 'addresses', 'orders', 'privacy-policy']),
    'account-details'
  ),
});

export const Route = createFileRoute('/_authenticated/_customer/account')({
  component: AccountPage,
  validateSearch: searchSchema,
});
