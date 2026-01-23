import { api } from '@/lib/api-client';
import { createMutation, invalidateQueries } from '@/lib/react-query';

import { usePaymentMethods } from './get-payment-methods';

export const useDeletePaymentMethod = createMutation({
  mutationFn: (paymentMethodId: string): Promise<void> =>
    api.delete(`users/payment-methods/${paymentMethodId}`),
  use: [invalidateQueries([usePaymentMethods.getKey()])],
});
