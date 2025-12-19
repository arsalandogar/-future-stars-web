import { useMutation } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import type { MutationConfig } from '@/lib/react-query';

import { useAuthStore } from '../stores/auth-store';
import type { AuthResponse, RegisterCredentials } from '../types';

export async function register(
  credentials: RegisterCredentials
): Promise<AuthResponse> {
  return api.post('auth/register', credentials);
}

type UseRegisterOptions = {
  mutationConfig?: MutationConfig<typeof register>;
};

export function useRegister({ mutationConfig }: UseRegisterOptions = {}) {
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: register,
    ...mutationConfig,
    onSuccess: (data, ...args) => {
      setAuth(data.token, data.user);
      mutationConfig?.onSuccess?.(data, ...args);
    },
  });
}
