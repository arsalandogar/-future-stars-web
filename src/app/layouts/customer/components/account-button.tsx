import { ActionIcon } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { Link, useLocation, useNavigate } from '@tanstack/react-router';
import { User } from 'lucide-react';

import { useAccountSidebarStore } from '@/features/customer/stores/account-sidebar-store';

export function AccountButton() {
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const { open, toggle } = useAccountSidebarStore();

  const isOnAccountPage = location.pathname === '/account';

  const handleMobileClick = () => {
    if (isOnAccountPage) {
      // Already on account page, just toggle the drawer
      toggle();
    } else {
      // Navigate to account page and open the drawer
      open();
      void navigate({ to: '/account' });
    }
  };

  if (isMobile) {
    return (
      <ActionIcon
        variant="subtle"
        size="lg"
        color="gray"
        aria-label="Account menu"
        onClick={handleMobileClick}
      >
        <User size={22} color="white" />
      </ActionIcon>
    );
  }

  return (
    <ActionIcon
      component={Link}
      to="/account"
      variant="subtle"
      size="lg"
      color="gray"
      aria-label="Account"
    >
      <User size={22} color="white" />
    </ActionIcon>
  );
}
