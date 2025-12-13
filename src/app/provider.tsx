import { Suspense, type ReactNode } from 'react';
import { HelmetProvider } from '@dr.pogodin/react-helmet';
import { Center, Loader, MantineProvider } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import { Notifications } from '@mantine/notifications';
import { ErrorBoundary } from 'react-error-boundary';

import { MainErrorFallback } from '@/components/errors/main';

type AppProviderProps = {
  children: ReactNode;
};

export function AppProvider({ children }: AppProviderProps) {
  return (
    <Suspense
      fallback={
        <Center h="100vh" w="100vw">
          <Loader size="xl" />
        </Center>
      }
    >
      <ErrorBoundary FallbackComponent={MainErrorFallback}>
        <HelmetProvider>
          <MantineProvider>
            <ModalsProvider>
              <Notifications />
              {children}
            </ModalsProvider>
          </MantineProvider>
        </HelmetProvider>
      </ErrorBoundary>
    </Suspense>
  );
}
