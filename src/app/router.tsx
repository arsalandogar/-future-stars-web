import { RouterProvider, createRouter } from '@tanstack/react-router';
import { routeTree } from '@/routeTree.gen';
import { useAuthStore } from '@/stores/auth-store';
import { queryClient } from '@/lib/react-query';
import type { RouterContext } from '@/routes/__root';

const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
  defaultPreloadStaleTime: 0,
  scrollRestoration: true,
  context: {
    auth: {
      isAuthenticated: false,
      user: null,
    },
    queryClient,
  },
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
