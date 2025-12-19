import { useState, Suspense, type ReactNode } from 'react';
import { HelmetProvider } from '@dr.pogodin/react-helmet';
import { Center, Loader, MantineProvider } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import { Notifications } from '@mantine/notifications';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ErrorBoundary } from 'react-error-boundary';

import { MainErrorFallback } from '@/components/errors/main';
import { theme } from '@/config/theme';
import { queryConfig } from '@/lib/react-query';

type AppProviderProps = {
  children: ReactNode;
};

export function AppProvider({ children }: AppProviderProps) {
  const [queryClient] = useState(
    () => new QueryClient({ defaultOptions: queryConfig })
  );

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
          <QueryClientProvider client={queryClient}>
            <MantineProvider theme={theme}>
              <ModalsProvider>
                <Notifications />
                {children}
              </ModalsProvider>
            </MantineProvider>
            {import.meta.env.DEV && <ReactQueryDevtools />}
          </QueryClientProvider>
        </HelmetProvider>
      </ErrorBoundary>
    </Suspense>
  );
}
