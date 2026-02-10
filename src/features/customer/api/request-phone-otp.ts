import { api } from '@/lib/api-client';
import { createMutation } from '@/lib/react-query';

interface RequestPhoneOtpParams {
  phone: string;
  type: string;
}

interface RequestPhoneOtpResponse {
  message: string;
  expiresIn: number;
}

export const useRequestPhoneOtp = createMutation({
  mutationFn: (
    params: RequestPhoneOtpParams
  ): Promise<RequestPhoneOtpResponse> =>
    api.post('auth/phone/request-otp', params),
});
