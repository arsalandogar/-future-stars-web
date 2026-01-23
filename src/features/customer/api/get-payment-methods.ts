import { api } from '@/lib/api-client';
import { createQuery } from '@/lib/react-query';
import { useAuthStore } from '@/stores/auth-store';

export interface PaymentMethod {
  id: string;
  type: string;
  card?: {
    brand: string;
    last4: string;
    exp_month: number;
    exp_year: number;
  };
  isDefault: boolean;
}

export interface PaymentMethodsResponse {
  data: PaymentMethod[];
}

export const usePaymentMethods = createQuery({
  queryKey: ['customer', 'payment-methods'],
  fetcher: (): Promise<PaymentMethodsResponse> => {
    const userId = useAuthStore.getState().user?.id;
    if (!userId) throw new Error('User not authenticated');
    return api.get(`users/${userId}/payment-methods`);
  },
});
