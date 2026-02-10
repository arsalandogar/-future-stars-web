import { type ReactNode, useEffect, useRef, useState } from 'react';

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
  const setAuth = useAuthStore((s) => s.setAuth);
  const [guestLoginDone, setGuestLoginDone] = useState(
    () => window.location.pathname === '/login'
  );
  const guestLoginAttempted = useRef(false);

  useEffect(() => {
    if (isAuthenticated || guestLoginAttempted.current || guestLoginDone)
      return;

    guestLoginAttempted.current = true;

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
  }, [isAuthenticated, setAuth]);

  if (!isAuthenticated && !guestLoginDone) {
    return (
      <Center h="100vh" w="100vw">
        <Loader size="xl" />
      </Center>
    );
  }

  return <>{children}</>;
}
