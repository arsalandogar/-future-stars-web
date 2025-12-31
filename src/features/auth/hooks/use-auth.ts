import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';

import { useLogin } from '../api/login';
import { useRegister } from '../api/register';
import type { LoginCredentials, RegisterCredentials } from '../types';

export function useAuth() {
  const { invalidate } = useRouter();
  const queryClient = useQueryClient();

  const loginMutation = useLogin();
  const registerMutation = useRegister();

  const resetAppState = async () => {
    queryClient.clear();
    await invalidate();
  };

  const login = async (credentials: LoginCredentials) => {
    await loginMutation.mutateAsync(credentials);
    await resetAppState();
  };

  const register = async (credentials: RegisterCredentials) => {
    await registerMutation.mutateAsync(credentials);
    await resetAppState();
  };

  return {
    login,
    register,
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
  };
}
