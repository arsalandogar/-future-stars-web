import { useMutation } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import type { MutationConfig } from '@/lib/react-query';

import { useAuthStore } from '../stores/auth-store';
import type { AuthResponse, LoginCredentials } from '../types';

export async function login(
  credentials: LoginCredentials
): Promise<AuthResponse> {
  return api.post('auth/login', credentials);
}

type UseLoginOptions = {
  mutationConfig?: MutationConfig<typeof login>;
};

export function useLogin({ mutationConfig }: UseLoginOptions = {}) {
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: login,
    ...mutationConfig,
    onSuccess: (data, ...args) => {
      setAuth(data.token, data.user);
      mutationConfig?.onSuccess?.(data, ...args);
    },
  });
}
