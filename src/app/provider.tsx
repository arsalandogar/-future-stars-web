import { Suspense, useState, type ReactNode } from 'react';
import { HelmetProvider } from '@dr.pogodin/react-helmet';
import { Center, Loader, MantineProvider } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import { Notifications } from '@mantine/notifications';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import { theme } from '@/config/theme';
import { cssVariableResolver } from '@/lib/css-variable-resolver';
import { queryConfig } from '@/lib/react-query';
import { useThemeStore } from '@/stores/theme-store';

type AppProviderProps = {
  children: ReactNode;
};

export function AppProvider({ children }: AppProviderProps) {
  const [queryClient] = useState(
    () => new QueryClient({ defaultOptions: queryConfig })
  );
  const colorScheme = useThemeStore((state) => state.colorScheme);

  return (
    <Suspense
      fallback={
        <Center h="100vh" w="100vw">
          <Loader size="xl" />
        </Center>
      }
    >
      <HelmetProvider>
        <QueryClientProvider client={queryClient}>
          <MantineProvider
            theme={theme}
            forceColorScheme={colorScheme}
            cssVariablesResolver={cssVariableResolver}
          >
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
