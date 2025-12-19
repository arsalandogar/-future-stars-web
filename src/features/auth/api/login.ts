import { api } from '@/lib/api-client';
import { createMutation } from '@/lib/react-query';

import { useAuthStore } from '../stores/auth-store';
import type { AuthResponse, LoginCredentials } from '../types';

export const useLogin = createMutation({
  mutationFn: (credentials: LoginCredentials): Promise<AuthResponse> =>
    api.post('auth/login', credentials),
  onSuccess: (data) => {
    useAuthStore.getState().setAuth(data.token, data.user);
  },
});
