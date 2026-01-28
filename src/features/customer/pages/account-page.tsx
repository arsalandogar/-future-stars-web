import { Box, Container, Drawer } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { getRouteApi } from '@tanstack/react-router';

import { Head } from '@/components/seo/head';

import { AccountDetailsSection } from '../components/account/account-details-section';
import { AccountSidebar } from '../components/account/account-sidebar';
import { AddressesSection } from '../components/account/addresses-section';
import { OrdersSection } from '../components/account/orders-section';
import { PaymentMethodsSection } from '../components/account/payment-methods-section';
import { PrivacyPolicySection } from '../components/account/privacy-policy-section';
import { useAccountSidebarStore } from '../stores/account-sidebar-store';
import styles from './account-page.module.css';

const routeApi = getRouteApi('/_authenticated/_customer/account');

type Section =
  | 'account-details'
  | 'payment-methods'
  | 'addresses'
  | 'orders'
  | 'privacy-policy';

const SECTION_TITLES: Record<Section, string> = {
  'account-details': 'Account Details',
  'payment-methods': 'Payment Methods',
  addresses: 'Shipping Addresses',
  orders: 'My Orders',
  'privacy-policy': 'Privacy Policy',
};

export function AccountPage() {
  const { section } = routeApi.useSearch();
  const { isOpen: drawerOpened, close: closeDrawer } = useAccountSidebarStore();
  const isMobile = useMediaQuery('(max-width: 768px)');

  const renderContent = () => {
    switch (section) {
      case 'account-details':
        return <AccountDetailsSection />;
      case 'payment-methods':
        return <PaymentMethodsSection />;
      case 'addresses':
        return <AddressesSection />;
      case 'orders':
        return <OrdersSection />;
      case 'privacy-policy':
        return <PrivacyPolicySection />;
      default:
        return <AccountDetailsSection />;
    }
  };

  return (
    <>
      <Head
        title={SECTION_TITLES[section]}
        description="Manage your account settings"
      />
      <Box className={styles.pageContainer}>
        <Container size="xl" className={styles.container}>
          <div className={styles.layout}>
            {!isMobile && (
              <aside className={styles.sidebar}>
                <AccountSidebar activeSection={section} />
              </aside>
            )}

            <main className={styles.content}>{renderContent()}</main>
          </div>
        </Container>
      </Box>

      <Drawer
        opened={drawerOpened}
        onClose={closeDrawer}
        size="300"
        padding="md"
        styles={{
          body: {
            padding: 0,
            height: '100%',
          },
          content: {
            backgroundColor: 'var(--mantine-color-surface-filled)',
          },
          header: {
            backgroundColor: 'var(--mantine-color-surface-filled)',
          },
        }}
      >
        <AccountSidebar activeSection={section} onNavigate={closeDrawer} />
      </Drawer>
    </>
  );
}
