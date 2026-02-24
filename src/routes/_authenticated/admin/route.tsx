import { createFileRoute, redirect } from '@tanstack/react-router';
import type { ErrorComponentProps } from '@tanstack/react-router';
import { QueryErrorResetBoundary } from '@tanstack/react-query';
import { Button, Center, Stack, Text, Title } from '@mantine/core';

import { AdminLayout } from '@/app/layouts/admin';
import { NotFound } from '@/components/errors/not-found';

export const Route = createFileRoute('/_authenticated/admin')({
  beforeLoad: ({ context }) => {
    if (!context.auth.user?.isAdmin) {
      // eslint-disable-next-line @typescript-eslint/only-throw-error
      throw redirect({
        to: '/',
      });
    }
  },
  component: AdminLayout,
  errorComponent: AdminErrorFallback,
  notFoundComponent: NotFound,
});

function AdminErrorFallback({ error, reset }: ErrorComponentProps) {
  return (
    <QueryErrorResetBoundary>
      {({ reset: resetQuery }) => (
        <Center py="xl">
          <Stack align="center" gap="md" maw={600}>
            <Title order={2}>Something went wrong</Title>
            <Text c="dimmed">
              An unexpected error occurred. Please try again.
            </Text>
            {import.meta.env.DEV && (
              <Text
                c="red"
                size="sm"
                style={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}
              >
                {error.message}
              </Text>
            )}
            <Button
              onClick={() => {
                resetQuery();
                reset();
              }}
            >
              Try Again
            </Button>
          </Stack>
        </Center>
      )}
    </QueryErrorResetBoundary>
  );
}
