import {
  NavLink,
  ScrollArea,
  Stack,
  Group,
  ActionIcon,
  Tooltip,
  Menu,
} from '@mantine/core';
import { Link, useLocation } from '@tanstack/react-router';
import {
  LayoutGrid,
  Users,
  Layers2,
  ChevronLeft,
  ChevronRight,
  X,
  Box,
  Settings,
  Scale,
  Palette,
} from 'lucide-react';

import { Logo } from './logo';

interface NavChildItem {
  label: string;
  href: string;
}

interface NavItem {
  label: string;
  icon: React.ComponentType<{ size?: number }>;
  href?: string;
  children?: NavChildItem[];
}

const menuItems: NavItem[] = [
  { label: 'Dashboard', icon: LayoutGrid, href: '/admin' },
  { label: 'Users', icon: Users, href: '/admin/users' },
  {
    label: 'Orders',
    icon: Box,
    children: [
      { label: 'Orders', href: '/admin/orders' },
      { label: 'Batches', href: '/admin/batches' },
    ],
  },
  {
    label: 'Templates',
    icon: Layers2,
    children: [
      { label: 'Tags', href: '/admin/tags' },
      { label: 'Template Types', href: '/admin/template-types' },
      { label: 'Templates', href: '/admin/templates' },
    ],
  },
  {
    label: 'Legal',
    icon: Scale,
    children: [
      { label: 'Privacy Policy', href: '/admin/privacy-policy' },
      { label: 'Terms & Conditions', href: '/admin/terms' },
    ],
  },
  {
    label: 'Colors',
    icon: Palette,
    children: [
      { label: 'Color Leagues', href: '/admin/color-leagues' },
      { label: 'Color Presets', href: '/admin/color-presets' },
    ],
  },
  {
    label: 'Settings',
    icon: Settings,
    children: [
      { label: 'Configs', href: '/admin/configs' },
      { label: 'Featured Items', href: '/admin/featured-items' },
    ],
  },
];

interface NavSectionProps {
  items: NavItem[];
  collapsed: boolean;
  onItemClick?: () => void;
}

function NavSection({ items, collapsed, onItemClick }: NavSectionProps) {
  const { pathname } = useLocation();

  const renderNavLink = (item: NavItem) => {
    const key = item.href ?? item.label;
    const hasChildren = !!item.children;
    const hasActiveChild = item.children?.some(
      (child) => child.href && pathname.startsWith(child.href)
    );
    const linkProps = item.href
      ? {
          component: Link,
          to: item.href,
          activeOptions: { exact: item.href === '/admin' },
          activeProps: { 'aria-current': 'page' as const },
          onClick: onItemClick,
        }
      : {};

    const navLink = (
      <NavLink
        key={key}
        label={collapsed ? undefined : item.label}
        leftSection={<item.icon size={20} />}
        active={hasActiveChild ? true : undefined}
        variant={hasChildren ? 'subtle' : undefined}
        defaultOpened={hasActiveChild}
        {...linkProps}
      >
        {!collapsed &&
          item.children?.map((child) => (
            <NavLink
              key={child.href}
              component={Link}
              to={child.href}
              activeOptions={{ exact: true, includeSearch: false }}
              activeProps={{ 'aria-current': 'page' }}
              label={child.label}
              onClick={onItemClick}
            />
          ))}
      </NavLink>
    );

    // Collapsed with children: show hover menu
    if (collapsed && item.children) {
      return (
        <Menu
          key={key}
          trigger="hover"
          position="right-start"
          withArrow
          offset={12}
        >
          <Menu.Target>{navLink}</Menu.Target>
          <Menu.Dropdown>
            <Menu.Label>{item.label}</Menu.Label>
            {item.children.map((child) => {
              const isActive = child.href && pathname === child.href;
              return (
                <Menu.Item
                  key={child.href ?? child.label}
                  component={Link}
                  to={child.href}
                  onClick={onItemClick}
                  bg={
                    isActive ? 'var(--mantine-primary-color-light)' : undefined
                  }
                >
                  {child.label}
                </Menu.Item>
              );
            })}
          </Menu.Dropdown>
        </Menu>
      );
    }

    // Collapsed without children: show tooltip
    if (collapsed) {
      return (
        <Tooltip key={key} label={item.label} position="right" withArrow>
          {navLink}
        </Tooltip>
      );
    }

    return navLink;
  };

  return <Stack gap={2}>{items.map(renderNavLink)}</Stack>;
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
          <Stack gap="xs" align="center">
            <Tooltip label="Future Stars" position="right" withArrow>
              <Link to="/">
                <Logo />
              </Link>
            </Tooltip>
            <Tooltip label="Expand" position="right" withArrow>
              <ActionIcon
                variant="subtle"
                color="gray"
                size="sm"
                onClick={onToggle}
              >
                <ChevronRight size={18} />
              </ActionIcon>
            </Tooltip>
          </Stack>
        ) : (
          <>
            <Link to="/">
              <Logo />
            </Link>
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
