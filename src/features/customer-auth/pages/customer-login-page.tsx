import { useEffect } from 'react';

import { CustomerAuthLayout } from '../components/customer-auth-layout';
import { CustomerAuthFlow } from '../components/customer-auth-flow';
import { useCustomerAuthStore } from '../stores/customer-auth-store';

const STEP_CONFIG = {
  'phone-input': {
    title: 'Welcome',
    description: 'Sign in with your phone number or continue as a guest',
  },
  signup: {
    title: 'Sign Up',
    description: 'Create your account',
  },
  'otp-verify': {
    title: 'Verify',
    description: 'Enter the verification code',
  },
} as const;

export function CustomerLoginPage() {
  const step = useCustomerAuthStore((s) => s.step);
  const reset = useCustomerAuthStore((s) => s.reset);
  const { title, description } = STEP_CONFIG[step];

  // Reset flow state when navigating away
  useEffect(() => {
    return () => {
      reset();
    };
  }, [reset]);

  return (
    <CustomerAuthLayout title={title} description={description}>
      <CustomerAuthFlow />
    </CustomerAuthLayout>
  );
}
