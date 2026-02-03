import { api } from '@/lib/api-client';
import { createMutation, invalidateQueries } from '@/lib/react-query';

import type { Order, ShipmentStatus } from '../types';
import { useOrder } from './get-order';
import { useOrders } from './get-orders';

interface UpdateShipmentStatusParams {
  orderId: number;
  shipmentStatus: ShipmentStatus;
}

export const useUpdateShipmentStatus = createMutation({
  mutationFn: ({
    orderId,
    shipmentStatus,
  }: UpdateShipmentStatusParams): Promise<Order> =>
    api.put(`admin/orders/${orderId}`, { shipmentStatus }),
  use: [invalidateQueries([useOrders.getKey(), useOrder.getKey()])],
});
