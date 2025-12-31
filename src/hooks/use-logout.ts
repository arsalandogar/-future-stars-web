import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';

import { useAuthStore } from '@/stores/auth-store';

export function useLogout() {
  const { invalidate } = useRouter();
  const queryClient = useQueryClient();
  const clearAuth = useAuthStore((state) => state.clearAuth);

  const logout = () => {
    clearAuth();
    queryClient.clear();
    setTimeout(() => {
      void invalidate();
    }, 0);
  };

  return logout;
}
