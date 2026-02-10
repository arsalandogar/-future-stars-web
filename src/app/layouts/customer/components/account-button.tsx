import { ActionIcon, Menu } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { Link, useLocation, useNavigate } from '@tanstack/react-router';
import { User, UserPlus } from 'lucide-react';

import { useAccountSidebarStore } from '@/features/customer/stores/account-sidebar-store';
import { useAuthStore } from '@/stores/auth-store';

export function AccountButton() {
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const { open, toggle } = useAccountSidebarStore();
  const isGuest = useAuthStore((s) => s.user?.isGuest ?? true);

  const isOnAccountPage = location.pathname === '/account';

  const handleMobileClick = () => {
    if (isOnAccountPage) {
      toggle();
    } else {
      open();
      void navigate({ to: '/account' });
    }
  };

  if (isGuest) {
    return (
      <Menu shadow="md" width={200}>
        <Menu.Target>
          <ActionIcon
            variant="subtle"
            size="lg"
            color="gray"
            aria-label="Account menu"
          >
            <User size={22} color="white" />
          </ActionIcon>
        </Menu.Target>
        <Menu.Dropdown>
          <Menu.Item
            leftSection={<UserPlus size={16} />}
            onClick={() => void navigate({ to: '/login' })}
          >
            Sign Up
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>
    );
  }

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
