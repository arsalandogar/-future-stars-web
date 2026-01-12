import { AppShell, Container } from '@mantine/core';
import { Outlet } from '@tanstack/react-router';

import { CustomerFooter } from './components/customer-footer';
import { CustomerHeader } from './components/customer-header';

const HEADER_HEIGHT = 84;

export function CustomerLayout() {
  return (
    <AppShell header={{ height: HEADER_HEIGHT }}>
      <AppShell.Header
        style={{ borderBottomColor: 'var(--mantine-color-primaryAlt-4)' }}
      >
        <CustomerHeader />
      </AppShell.Header>

      <AppShell.Main>
        <Container size="xl" p="xl">
          <Outlet />
        </Container>
      </AppShell.Main>

      <CustomerFooter />
    </AppShell>
  );
}
