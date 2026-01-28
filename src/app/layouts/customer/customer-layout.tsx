import { AppShell, Container } from '@mantine/core';
import { Outlet, useLocation } from '@tanstack/react-router';

import {
  GlobalAddedToCartPopup,
  GlobalCreatePackModal,
  GlobalPackAutofillModal,
} from '@/features/customer';

import { CustomerFooter } from './components/customer-footer';
import { CustomerHeader } from './components/customer-header';
import styles from './customer-layout.module.css';

const HEADER_HEIGHT = 84;

export function CustomerLayout() {
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
        <CustomerHeader />
      </AppShell.Header>

      <AppShell.Main className={styles.layout}>
        <Container size="xl" p={{ base: 'sm', sm: 'xl' }}>
          <div key={location.pathname} className={styles.pageTransition}>
            <Outlet />
          </div>
        </Container>
      </AppShell.Main>

      <CustomerFooter />

      <GlobalCreatePackModal />
      <GlobalAddedToCartPopup />
      <GlobalPackAutofillModal />
    </AppShell>
  );
}
