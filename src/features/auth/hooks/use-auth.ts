import { useRouter, useSearch } from '@tanstack/react-router';

import { useLogin } from '../api/login';
import { useRegister } from '../api/register';
import { useAuthStore } from '../stores/auth-store';
import type { LoginCredentials, RegisterCredentials } from '../types';

export function useAuth() {
  const { invalidate, navigate } = useRouter();
  const { user, isAuthenticated, clearAuth } = useAuthStore();
  const loginSearch = useSearch({
    from: '/auth/login',
    shouldThrow: false,
  });

  const loginMutation = useLogin();
  const registerMutation = useRegister();

  const login = async (credentials: LoginCredentials) => {
    const redirectTo = loginSearch?.redirectTo;
    const result = await loginMutation.mutateAsync(credentials);
    const destination = redirectTo ?? (result.user.isAdmin ? '/admin' : '/');

    await invalidate();
    await navigate({ to: destination });
  };

  const register = async (credentials: RegisterCredentials) => {
    await registerMutation.mutateAsync(credentials);
    await invalidate();
    await navigate({ to: '/' });
  };

  const logout = async () => {
    clearAuth();
    await invalidate();
    await navigate({ to: '/auth/login' });
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
