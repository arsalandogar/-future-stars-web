import { RouterProvider, createRouter } from '@tanstack/react-router';
import { routeTree } from '@/routeTree.gen';
import { useAuthStore } from '@/stores/auth-store';
import type { RouterContext } from '@/routes/__root';

const router = createRouter({
  routeTree,
  context: {
    auth: {
      isAuthenticated: false,
      user: null,
    },
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
        } satisfies RouterContext
      }
    />
  );
}
