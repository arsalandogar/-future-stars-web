import type { Order } from '@/features/orders/types';

export interface CheckoutParams {
  cartItemIds: number[];
  shippingAddressId: number;
  acceptTerms: boolean;
}

export interface CheckoutResponseData {
  order: Order;
  paymentIntentSecret: string;
  customerSessionClientSecret: string;
  stripeCustomerId: string;
  ephemeralKey: string;
}

export interface CheckoutResponse {
  data: CheckoutResponseData;
}
