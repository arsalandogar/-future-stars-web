import { createRootRouteWithContext, Outlet } from '@tanstack/react-router';
import { Center, Loader } from '@mantine/core';

import type { QueryClient } from '@tanstack/react-query';

import type { User } from '@/types';
import { MainErrorFallback } from '@/components/errors/main';
import { NotFound } from '@/components/errors/not-found';

function RootComponent() {
  return <Outlet />;
}

function PendingComponent() {
  return (
    <Center h="100dvh" w="100%">
      <Loader size="xl" />
    </Center>
  );
}

function NotFoundComponent() {
  return (
    <Center h="100dvh" w="100%">
      <NotFound />
    </Center>
  );
}

export interface RouterContext {
  auth: {
    isAuthenticated: boolean;
    user: User | null;
  };
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
  pendingComponent: PendingComponent,
  errorComponent: MainErrorFallback,
  notFoundComponent: NotFoundComponent,
});
