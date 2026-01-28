import { AppShell, Container } from '@mantine/core';
import { Outlet, useLocation } from '@tanstack/react-router';

import {
  GlobalCreatePackModal,
  GlobalPackAutofillModal,
} from '@/features/customer';

import { CheckoutHeader } from './components/checkout-header';
import styles from './checkout-layout.module.css';

const HEADER_HEIGHT = 84;

export function CheckoutLayout() {
  const location = useLocation();

  return (
    <AppShell
      header={{ height: HEADER_HEIGHT }}
      styles={{
        main: {
          background:
            'linear-gradient(to bottom, var(--customer-bg-gradient-start), var(--customer-bg-gradient-end))',
          minHeight: '100vh',
          fontFamily:
            'Montserrat, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif',
        },
      }}
    >
      <AppShell.Header
        style={{ borderBottomColor: 'var(--mantine-color-primaryAlt-4)' }}
      >
        <CheckoutHeader />
      </AppShell.Header>

      <AppShell.Main className={styles.layout}>
        <Container size="xl" p={{ base: 'sm', sm: 'xl' }}>
          <div key={location.pathname} className={styles.pageTransition}>
            <Outlet />
          </div>
        </Container>
      </AppShell.Main>

      <GlobalCreatePackModal />
      <GlobalPackAutofillModal />
    </AppShell>
  );
}
