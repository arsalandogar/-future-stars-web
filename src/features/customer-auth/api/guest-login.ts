import { api } from '@/lib/api-client';
import { createMutation } from '@/lib/react-query';
import { useAuthStore } from '@/stores/auth-store';

import type { GuestLoginResponse } from '../types';

export const useGuestLogin = createMutation({
  mutationFn: (): Promise<GuestLoginResponse> => api.post('auth/guest'),
  onSuccess: (data) => {
    useAuthStore.getState().setAuth(data.token, data.user);
  },
});
