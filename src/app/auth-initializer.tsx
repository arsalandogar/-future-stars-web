import { type ReactNode, useEffect, useState } from 'react';

import { Center, Loader } from '@mantine/core';

import { api } from '@/lib/api-client';
import { useAuthStore } from '@/stores/auth-store';
import type { Token, User } from '@/types';

interface GuestLoginResponse {
  token: Token;
  user: User;
}

export function AuthInitializer({ children }: { children: ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [guestLoginDone, setGuestLoginDone] = useState(
    () => window.location.pathname === '/login'
  );

  useEffect(() => {
    const { isAuthenticated, setAuth } = useAuthStore.getState();
    if (isAuthenticated) return;

    api
      .post<unknown, GuestLoginResponse>('auth/guest')
      .then((data) => {
        setAuth(data.token, data.user);
      })
      .catch(() => {
        // If guest login fails, still allow the app to render
      })
      .finally(() => {
        setGuestLoginDone(true);
      });
  }, []);

  if (!isAuthenticated && !guestLoginDone) {
    return (
      <Center h="100dvh" w="100%">
        <Loader size="xl" />
      </Center>
    );
  }

  return <>{children}</>;
}
