import {
  NavLink,
  ScrollArea,
  Stack,
  Text,
  Group,
  ActionIcon,
  Tooltip,
  UnstyledButton,
} from '@mantine/core';
import { Link } from '@tanstack/react-router';
import { LayoutGrid, Users, Layers2, ChevronLeft, X, Box } from 'lucide-react';

import { Logo } from './logo';

interface NavItem {
  label: string;
  icon: React.ComponentType<{ size?: number }>;
  href: string;
}

const menuItems: NavItem[] = [
  { label: 'Dashboard', icon: LayoutGrid, href: '/admin' },
  { label: 'Orders', icon: Box, href: '/admin/orders' },
  { label: 'Users', icon: Users, href: '/admin/users' },
  { label: 'Templates', icon: Layers2, href: '/admin/templates' },
];

interface NavSectionProps {
  items: NavItem[];
  collapsed: boolean;
  onItemClick?: () => void;
}

function NavSection({ items, collapsed, onItemClick }: NavSectionProps) {
  return (
    <Stack gap={2}>
      {items.map((item) => {
        const isExact = item.href === '/admin';

        const navLink = (
          <NavLink
            key={item.href}
            component={Link}
            to={item.href}
            activeOptions={{ exact: isExact }}
            activeProps={{ 'aria-current': 'page' }}
            label={collapsed ? undefined : item.label}
            leftSection={<item.icon size={20} />}
            onClick={onItemClick}
          />
        );

        if (collapsed) {
          return (
            <Tooltip
              key={item.href}
              label={item.label}
              position="right"
              withArrow
            >
              {navLink}
            </Tooltip>
          );
        }

        return navLink;
      })}
    </Stack>
  );
}

interface AdminNavbarProps {
  collapsed: boolean;
  onToggle: () => void;
  isMobile?: boolean;
  onMobileClose?: () => void;
}

export function AdminNavbar({
  collapsed,
  onToggle,
  isMobile,
  onMobileClose,
}: AdminNavbarProps) {
  const handleNavItemClick = () => {
    if (isMobile && onMobileClose) {
      onMobileClose();
    }
  };

  return (
    <nav className="flex h-full flex-col">
      <Group justify={collapsed ? 'center' : 'space-between'} px="md" py="lg">
        {collapsed ? (
          <Tooltip label="Future Stars" position="right" withArrow>
            <UnstyledButton onClick={onToggle}>
              <Logo />
            </UnstyledButton>
          </Tooltip>
        ) : (
          <>
            <Group gap="sm">
              <Logo />
              <Text fw={600} size="lg">
                Future Stars
              </Text>
            </Group>
            <ActionIcon
              variant="subtle"
              color="gray"
              size="sm"
              onClick={isMobile ? onMobileClose : onToggle}
            >
              {isMobile ? <X size={18} /> : <ChevronLeft size={18} />}
            </ActionIcon>
          </>
        )}
      </Group>

      <ScrollArea className="flex-1" px={collapsed ? 'xs' : 'sm'}>
        <Stack gap="xl" py="xs">
          <NavSection
            items={menuItems}
            collapsed={collapsed}
            onItemClick={handleNavItemClick}
          />
        </Stack>
      </ScrollArea>
    </nav>
  );
}
