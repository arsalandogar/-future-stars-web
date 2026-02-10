import { api } from '@/lib/api-client';
import { createMutation } from '@/lib/react-query';
import { useAuthStore } from '@/stores/auth-store';

import type { VerifyOtpParams, VerifyOtpResponse } from '../types';

export const useVerifyOtp = createMutation({
  mutationFn: (params: VerifyOtpParams): Promise<VerifyOtpResponse> =>
    api.post('auth/phone/verify-otp', params),
  onSuccess: (data) => {
    useAuthStore.getState().setAuth(data.token, data.user);
  },
});
