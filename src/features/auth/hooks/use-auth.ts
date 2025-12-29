import { useRouter, useSearch } from '@tanstack/react-router';

import { useLogin } from '../api/login';
import { useRegister } from '../api/register';
import type { LoginCredentials, RegisterCredentials } from '../types';

export function useAuth() {
  const { invalidate, navigate } = useRouter();
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

  return {
    login,
    register,
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
  };
}
