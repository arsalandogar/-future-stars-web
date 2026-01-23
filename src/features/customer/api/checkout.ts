import type { CheckoutParams, CheckoutResponse } from '@/types';

import { api } from '@/lib/api-client';
import { createMutation } from '@/lib/react-query';

export const useCheckout = createMutation({
  mutationFn: (params: CheckoutParams): Promise<CheckoutResponse> =>
    api.post('orders/checkout', params),
  // Cart invalidation happens after payment success in confirm-payment.ts
});
