import {
  createRootRouteWithContext,
  Outlet,
  useRouter,
} from '@tanstack/react-router';
import { Center, Loader, Button, Stack, Text, Title } from '@mantine/core';

import type { User } from '@/types';
import { MainErrorFallback } from '@/components/errors/main';

function RootComponent() {
  return <Outlet />;
}

function PendingComponent() {
  return (
    <Center h="100vh" w="100vw">
      <Loader size="xl" />
    </Center>
  );
}

function NotFoundComponent() {
  const router = useRouter();

  return (
    <Center h="100vh" w="100vw">
      <Stack align="center" gap="md">
        <Title order={1}>404</Title>
        <Text size="xl">Page Not Found</Text>
        <Text c="dimmed">The page you are looking for does not exist.</Text>
        <Button onClick={() => void router.navigate({ to: '/' })}>
          Go Home
        </Button>
      </Stack>
    </Center>
  );
}

export interface RouterContext {
  auth: {
    isAuthenticated: boolean;
    user: User | null;
  };
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
  pendingComponent: PendingComponent,
  errorComponent: MainErrorFallback,
  notFoundComponent: NotFoundComponent,
});
