import { api } from '@/lib/api-client';
import { createMutation } from '@/lib/react-query';
import { useAuthStore } from '@/stores/auth-store';

import type { MergeGuestParams, MergeGuestResponse } from '../types';

export const useMergeGuest = createMutation({
  mutationFn: (params: MergeGuestParams): Promise<MergeGuestResponse> =>
    api.post('auth/merge-guest', params),
  onSuccess: (data) => {
    useAuthStore.getState().setAuth(data.token, data.user);
  },
});
