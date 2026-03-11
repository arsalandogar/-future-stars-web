import { Suspense, type ReactNode } from 'react';
import { HelmetProvider } from '@dr.pogodin/react-helmet';
import { Center, Loader, MantineProvider } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import { NavigationProgress } from '@mantine/nprogress';
import { Notifications } from '@mantine/notifications';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import { theme } from '@/config/theme';
import { cssVariableResolver } from '@/lib/css-variable-resolver';
import { queryClient } from '@/lib/react-query';

type AppProviderProps = {
  children: ReactNode;
};

export function AppProvider({ children }: AppProviderProps) {
  return (
    <Suspense
      fallback={
        <Center h="100dvh" w="100%">
          <Loader size="xl" />
        </Center>
      }
    >
      <HelmetProvider>
        <QueryClientProvider client={queryClient}>
          <MantineProvider
            theme={theme}
            forceColorScheme="dark"
            cssVariablesResolver={cssVariableResolver}
          >
            <NavigationProgress />
            <ModalsProvider>
              <Notifications />
              {children}
            </ModalsProvider>
          </MantineProvider>
          {import.meta.env.DEV && <ReactQueryDevtools />}
        </QueryClientProvider>
      </HelmetProvider>
    </Suspense>
  );
}
