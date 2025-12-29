import { useQueryClient } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { createMutation } from '@/lib/react-query';

import type { Order, OrderStatus } from '../types';

interface UpdateOrderStatusParams {
  orderId: number;
  status: OrderStatus;
}

export const useUpdateOrderStatus = createMutation({
  mutationFn: ({ orderId, status }: UpdateOrderStatusParams): Promise<Order> =>
    api.put(`admin/orders/${orderId}`, { status }),
});

export function useUpdateOrderStatusWithInvalidation() {
  const queryClient = useQueryClient();

  return useUpdateOrderStatus({
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] });
      void queryClient.invalidateQueries({ queryKey: ['admin', 'order'] });
    },
  });
}
