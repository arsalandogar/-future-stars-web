import { useRouter } from '@tanstack/react-router';

import { useLogin } from '../api/login';
import { useRegister } from '../api/register';
import { useAuthStore } from '../stores/auth-store';
import type { LoginCredentials, RegisterCredentials } from '../types';

export function useAuth() {
  const router = useRouter();
  const { user, isAuthenticated, clearAuth } = useAuthStore();
  const loginMutation = useLogin();
  const registerMutation = useRegister();

  const login = async (
    credentials: LoginCredentials,
    redirectTo: string = '/'
  ) => {
    await loginMutation.mutateAsync(credentials);
    await router.invalidate();
    await router.navigate({ to: redirectTo });
  };

  const register = async (
    credentials: RegisterCredentials,
    redirectTo: string = '/'
  ) => {
    await registerMutation.mutateAsync(credentials);
    await router.invalidate();
    await router.navigate({ to: redirectTo });
  };

  const logout = async () => {
    clearAuth();
    await router.invalidate();
    await router.navigate({ to: '/auth/login' });
  };

  return {
    user,
    isAuthenticated,
    login,
    register,
    logout,
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
  };
}
