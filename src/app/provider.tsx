import type { ReactNode } from 'react';
import { MantineProvider } from '@mantine/core';

type AppProviderProps = {
  children: ReactNode;
};

export function AppProvider({ children }: AppProviderProps) {
  return <MantineProvider>{children}</MantineProvider>;
}
