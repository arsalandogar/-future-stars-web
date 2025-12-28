export type OrderStatus =
  | 'created'
  | 'payment_failed'
  | 'paid'
  | 'processing'
  | 'sent_to_production'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export interface OrderUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
}

export interface ShippingAddress {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface OrderLineItem {
  id: number;
  productId: number;
  quantity: number;
  price: number;
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

export interface PaginationMeta {
  total: number;
  perPage: number;
  currentPage: number;
  lastPage: number;
}

export interface OrdersListResponse {
  meta: PaginationMeta;
  data: Order[];
}
