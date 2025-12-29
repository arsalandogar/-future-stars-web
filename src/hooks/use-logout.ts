import { useRouter } from '@tanstack/react-router';

import { useAuthStore } from '@/stores/auth-store';

export function useLogout() {
  const { invalidate, navigate } = useRouter();
  const clearAuth = useAuthStore((state) => state.clearAuth);

  const logout = async () => {
    clearAuth();
    await invalidate();
    await navigate({ to: '/auth/login' });
  };

  return logout;
}
