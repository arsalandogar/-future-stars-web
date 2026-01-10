import type { PaginationMeta } from '@/types';

import type { OrderStatus } from '../constants';

export type { OrderStatus };

export interface OrderUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
}

export interface ShippingAddress {
  firstName: string;
  lastName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface PackCardSnapshot {
  cardId: number;
  quantity: number;
  svgString: string;
}

export interface PackSnapshot {
  id: number;
  name: string;
  cardSnapshots: PackCardSnapshot[];
}

export interface OrderLineItem {
  id: number;
  orderId: number;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  packSnapshot: PackSnapshot;
}

export interface Order {
  id: number;
  userId: number;
  stripePaymentIntentId: string;
  totalAmount: number;
  status: OrderStatus;
  shippingAddress: ShippingAddress;
  user: OrderUser;
  lineItems: OrderLineItem[];
  createdAt: string;
  updatedAt: string;
}

export interface OrdersListParams {
  page?: number;
  limit?: number;
  userId?: number;
  status?: OrderStatus;
  search?: string;
}

export interface OrdersListResponse {
  meta: PaginationMeta;
  data: Order[];
}

export interface OrderResponse {
  data: Order;
}
