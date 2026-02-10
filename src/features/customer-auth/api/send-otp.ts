import { api } from '@/lib/api-client';
import { createMutation } from '@/lib/react-query';

import type { RequestOtpParams, RequestOtpResponse } from '../types';

export const useSendOtp = createMutation({
  mutationFn: (params: RequestOtpParams): Promise<RequestOtpResponse> =>
    api.post('auth/phone/request-otp', params),
});
