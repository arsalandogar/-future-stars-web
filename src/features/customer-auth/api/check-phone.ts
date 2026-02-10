import { api } from '@/lib/api-client';
import { createMutation } from '@/lib/react-query';

import type { CheckPhoneParams, CheckPhoneResponse } from '../types';

export const useCheckPhone = createMutation({
  mutationFn: (params: CheckPhoneParams): Promise<CheckPhoneResponse> =>
    api.post('auth/phone/check', params),
});
