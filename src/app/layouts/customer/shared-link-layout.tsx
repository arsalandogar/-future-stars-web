import { AppShell } from '@mantine/core';
import { Outlet } from '@tanstack/react-router';

import { CustomerFooter } from './components/customer-footer';
import { CustomerHeader } from './components/customer-header';

const HEADER_HEIGHT = 84;

export function SharedLinkLayout() {
  return (
    <AppShell
      header={{ height: HEADER_HEIGHT }}
      styles={{
        root: {
          minHeight: '100dvh',
        },
        main: {
          display: 'flex',
          flexDirection: 'column',
          background:
            'linear-gradient(to bottom, var(--customer-bg-gradient-start), var(--customer-bg-gradient-end))',
          minHeight: '100dvh',
          fontFamily:
            'Montserrat, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif',
        },
        header: {
          backgroundColor: 'var(--mantine-color-body)',
          borderBottomColor: 'var(--mantine-color-primaryAlt-4)',
        },
      }}
    >
      <AppShell.Header>
        <CustomerHeader />
      </AppShell.Header>

      <AppShell.Main>
        <Outlet />
      </AppShell.Main>

      <CustomerFooter />
    </AppShell>
  );
}
