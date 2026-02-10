import { useCustomerAuthStore } from '../stores/customer-auth-store';

import { OtpVerifyForm } from './otp-verify-form';
import { PhoneLoginForm } from './phone-login-form';
import { SignupForm } from './signup-form';

export function CustomerAuthFlow() {
  const step = useCustomerAuthStore((s) => s.step);

  switch (step) {
    case 'phone-input':
      return <PhoneLoginForm />;
    case 'signup':
      return <SignupForm />;
    case 'otp-verify':
      return <OtpVerifyForm />;
  }
}
