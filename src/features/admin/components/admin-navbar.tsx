import { NavLink, ScrollArea, Stack, Text, Group, Badge } from '@mantine/core';
import { Link } from '@tanstack/react-router';
import {
  LayoutDashboard,
  ShoppingCart,
  Users,
  FileText,
  CheckSquare,
  UserCog,
  Settings,
  LogOut,
  Menu,
} from 'lucide-react';

import { useAuth } from '@/features/auth';

interface NavItem {
  label: string;
  icon: React.ComponentType<{ size?: number }>;
  href: string;
  badge?: number;
}

const menuItems: NavItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/admin' },
  { label: 'Orders', icon: ShoppingCart, href: '/admin/orders', badge: 12 },
  { label: 'Customers', icon: Users, href: '/admin/customers', badge: 5 },
  { label: 'Templates', icon: FileText, href: '/admin/templates' },
  { label: 'Tasks', icon: CheckSquare, href: '/admin/tasks' },
];

const adminItems: NavItem[] = [
  { label: 'Users', icon: UserCog, href: '/admin/users' },
  { label: 'Settings', icon: Settings, href: '/admin/settings' },
];

interface NavSectionProps {
  title: string;
  items: NavItem[];
  showMenuIcon?: boolean;
}

function NavSection({ title, items, showMenuIcon }: NavSectionProps) {
  return (
    <Stack gap={4}>
      <Group justify="space-between" px="md" py="xs">
        <Text size="xs" fw={600} c="dimmed" tt="uppercase">
          {title}
        </Text>
        {showMenuIcon && <Menu size={16} className="text-gray-400" />}
      </Group>
      {items.map((item) => {
        return (
          <NavLink
            key={item.href}
            component={Link}
            to={item.href}
            label={item.label}
            leftSection={<item.icon size={20} />}
            rightSection={
              item.badge ? (
                <Badge size="sm" variant="light" color="blue" radius="sm">
                  {item.badge}
                </Badge>
              ) : undefined
            }
          />
        );
      })}
    </Stack>
  );
}

export function AdminNavbar() {
  const { logout } = useAuth();

  return (
    <nav className="flex h-full flex-col">
      <ScrollArea className="flex-1" px="md">
        <Stack gap="lg" py="md">
          <NavSection title="Menu" items={menuItems} showMenuIcon />
          <NavSection title="Admin" items={adminItems} />
        </Stack>
      </ScrollArea>

      <div className="border-t border-gray-200 p-4">
        <NavLink
          label="Log Out"
          leftSection={<LogOut size={20} />}
          onClick={() => void logout()}
          className="cursor-pointer"
        />
      </div>
    </nav>
  );
}
