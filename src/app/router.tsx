import { RouterProvider, createRouter } from '@tanstack/react-router';
import { Center, Loader } from '@mantine/core';
import { nprogress } from '@mantine/nprogress';
import { routeTree } from '@/routeTree.gen';
import { useAuthStore } from '@/stores/auth-store';
import { queryClient } from '@/lib/react-query';
import { MainErrorFallback } from '@/components/errors/main';
import type { RouterContext } from '@/routes/__root';

function DefaultPendingComponent() {
  return (
    <Center py="xl">
      <Loader />
    </Center>
  );
}

const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
  defaultPreloadStaleTime: 0,
  defaultErrorComponent: MainErrorFallback,
  defaultPendingComponent: DefaultPendingComponent,

  scrollRestoration: true,
  context: {
    auth: {
      isAuthenticated: false,
      user: null,
    },
    queryClient,
  },
});

router.subscribe('onBeforeLoad', ({ pathChanged }) => {
  if (pathChanged) nprogress.start();
});

router.subscribe('onLoad', ({ pathChanged }) => {
  if (pathChanged) nprogress.complete();
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export function AppRouter() {
  const { isAuthenticated, user } = useAuthStore();

  return (
    <RouterProvider
      router={router}
      context={
        {
          auth: {
            isAuthenticated,
            user,
          },
          queryClient,
        } satisfies RouterContext
      }
    />
  );
}
