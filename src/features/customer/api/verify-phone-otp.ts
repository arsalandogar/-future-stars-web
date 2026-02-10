import type { Token, User } from '@/types';

import { api } from '@/lib/api-client';
import { createMutation } from '@/lib/react-query';
import { useAuthStore } from '@/stores/auth-store';

interface VerifyPhoneOtpParams {
  phone: string;
  otp: string;
  type: string;
}

interface VerifyPhoneOtpResponse {
  token: Token;
  user: User;
  message: string;
}

export const useVerifyPhoneOtp = createMutation({
  mutationFn: (params: VerifyPhoneOtpParams): Promise<VerifyPhoneOtpResponse> =>
    api.post('auth/phone/verify-otp', params),
  onSuccess: (data) => {
    useAuthStore.getState().setAuth(data.token, data.user);
  },
});
