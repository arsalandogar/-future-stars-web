import { api } from '@/lib/api-client';
import { createMutation, invalidateQueries } from '@/lib/react-query';

import { usePaymentMethods } from './get-payment-methods';

export const useSetDefaultPayment = createMutation({
  mutationFn: (paymentMethodId: string): Promise<void> =>
    api.patch(`users/payment-methods/${paymentMethodId}/default`),
  use: [invalidateQueries([usePaymentMethods.getKey()])],
});
