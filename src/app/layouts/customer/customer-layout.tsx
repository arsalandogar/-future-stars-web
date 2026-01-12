import { AppShell } from '@mantine/core';
import { Outlet } from '@tanstack/react-router';

import { CustomerFooter } from './components/customer-footer';
import { CustomerHeader } from './components/customer-header';

const HEADER_HEIGHT = 84;

export function CustomerLayout() {
  return (
    <AppShell header={{ height: HEADER_HEIGHT }} padding={0}>
      <AppShell.Header>
        <CustomerHeader />
      </AppShell.Header>

      <AppShell.Main>
        <Outlet />
      </AppShell.Main>

      <AppShell.Footer>
        <CustomerFooter />
      </AppShell.Footer>
    </AppShell>
  );
}
