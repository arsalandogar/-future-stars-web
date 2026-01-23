import type { Stripe } from '@stripe/stripe-js';
import { loadStripe } from '@stripe/stripe-js';

import { env } from '@/config/env';

let stripePromiseInstance: Promise<Stripe | null> | null = null;

export function getStripePromise() {
  if (!stripePromiseInstance) {
    stripePromiseInstance = loadStripe(env.STRIPE_PUBLISHABLE_KEY);
  }
  return stripePromiseInstance;
}

export const stripeAppearance = {
  theme: 'night' as const,
  variables: {
    colorPrimary: '#5046FF',
    colorBackground: '#1A212B',
    colorText: '#ffffff',
    colorTextSecondary: '#9CA3AF',
    colorDanger: '#EF4444',
    fontFamily: 'Montserrat, system-ui, sans-serif',
    borderRadius: '8px',
    spacingUnit: '4px',
  },
  rules: {
    '.Input': {
      backgroundColor: '#242B37',
      border: '1px solid #374151',
    },
    '.Input:focus': {
      borderColor: '#5046FF',
      boxShadow: '0 0 0 1px #5046FF',
    },
    '.Label': {
      color: '#9CA3AF',
    },
  },
};
