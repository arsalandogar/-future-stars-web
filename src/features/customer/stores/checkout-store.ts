import { create } from 'zustand';

import type { Address } from '@/types';

interface CheckoutState {
  // Selected address for shipping
  selectedAddress: Address | null;

  // Checkout response data (after calling checkout API)
  paymentIntentSecret: string | null;
  stripeCustomerId: string | null;
  ephemeralKey: string | null;
  orderId: number | null;

  // UI state
  isProcessingPayment: boolean;
  acceptTerms: boolean;

  // Actions
  setSelectedAddress: (address: Address | null) => void;
  setCheckoutData: (data: {
    paymentIntentSecret: string;
    stripeCustomerId: string;
    ephemeralKey: string;
    orderId: number;
  }) => void;
  setIsProcessingPayment: (processing: boolean) => void;
  setAcceptTerms: (accept: boolean) => void;
  reset: () => void;
}

const initialState = {
  selectedAddress: null,
  paymentIntentSecret: null,
  stripeCustomerId: null,
  ephemeralKey: null,
  orderId: null,
  isProcessingPayment: false,
  acceptTerms: false,
};

export const useCheckoutStore = create<CheckoutState>((set) => ({
  ...initialState,

  setSelectedAddress: (address) => set({ selectedAddress: address }),

  setCheckoutData: (data) =>
    set({
      paymentIntentSecret: data.paymentIntentSecret,
      stripeCustomerId: data.stripeCustomerId,
      ephemeralKey: data.ephemeralKey,
      orderId: data.orderId,
    }),

  setIsProcessingPayment: (processing) =>
    set({ isProcessingPayment: processing }),

  setAcceptTerms: (accept) => set({ acceptTerms: accept }),

  reset: () => set(initialState),
}));
