import { api } from '@/lib/api-client';
import { createMutation } from '@/lib/react-query';

import { useAuthStore } from '../stores/auth-store';
import type { AuthResponse, RegisterCredentials } from '../types';

export const useRegister = createMutation({
  mutationFn: (credentials: RegisterCredentials): Promise<AuthResponse> =>
    api.post('auth/register', credentials),
  onSuccess: (data) => {
    useAuthStore.getState().setAuth(data.token, data.user);
  },
});
