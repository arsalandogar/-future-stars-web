import {
  Group,
  Burger,
  TextInput,
  ActionIcon,
  Avatar,
  Menu,
  UnstyledButton,
  Text,
} from '@mantine/core';
import {
  Search,
  Bell,
  ChevronDown,
  MoreVertical,
  User,
  LogOut,
} from 'lucide-react';

import { ThemeToggle } from '@/components/theme-toggle';
import { useLogout } from '@/hooks/use-logout';
import { useAuthStore } from '@/stores/auth-store';

import { Logo } from './logo';
import { useHeaderStore } from '../stores/header-store';

interface AdminHeaderProps {
  opened: boolean;
  toggle: () => void;
}

export function AdminHeader({ opened, toggle }: AdminHeaderProps) {
  const { mobileMenuOpen, toggleMobileMenu } = useHeaderStore();
  const logout = useLogout();
  const user = useAuthStore((state) => state.user);

  const userMenuItems = (
    <>
      <Menu.Label>{user?.email}</Menu.Label>
      <Menu.Divider />
      <Menu.Item leftSection={<User size={16} />}>Profile</Menu.Item>
      <Menu.Divider />
      <Menu.Item
        leftSection={<LogOut size={16} />}
        color="red"
        onClick={() => void logout()}
      >
        Log Out
      </Menu.Item>
    </>
  );

  return (
    <div className="flex h-full flex-col">
      {/* Desktop Header */}
      <Group h="100%" px="md" justify="space-between" visibleFrom="sm">
        <TextInput
          placeholder="Global search..."
          leftSection={
            <Search size={16} className="text-(--mantine-color-dimmed)" />
          }
        />
        <Group gap="sm">
          <ThemeToggle />

          <ActionIcon
            variant="default"
            size="lg"
            radius="xl"
            aria-label="Notifications"
          >
            <Bell size={18} />
          </ActionIcon>

          <Menu shadow="md" width={200} position="bottom-end">
            <Menu.Target>
              <UnstyledButton className="flex items-center gap-2 rounded-full py-1 pl-1 pr-3 hover:bg-(--mantine-color-default-hover)">
                <Avatar
                  color="initials"
                  radius="xl"
                  size="md"
                  name={user?.fullName}
                />
                <Text size="sm" fw={500} className="hidden lg:block">
                  {user?.fullName ?? 'Admin User'}
                </Text>
                <ChevronDown
                  size={14}
                  className="text-(--mantine-color-dimmed)"
                />
              </UnstyledButton>
            </Menu.Target>
            <Menu.Dropdown>{userMenuItems}</Menu.Dropdown>
          </Menu>
        </Group>
      </Group>

      {/* Mobile Header */}
      <div className="sm:hidden">
        {/* Main Row */}
        <Group h={76} px="md" justify="space-between">
          <Burger
            opened={opened}
            onClick={toggle}
            size="sm"
            aria-label="Toggle navigation"
          />
          <Logo />
          <ActionIcon
            variant="default"
            size="lg"
            radius="md"
            onClick={toggleMobileMenu}
            aria-label="More options"
          >
            <MoreVertical size={20} />
          </ActionIcon>
        </Group>

        {/* Mobile Expanded Menu */}
        {mobileMenuOpen && (
          <Group
            h={60}
            px="md"
            justify="space-between"
            className="border-y border-(--mantine-color-default-border) bg-(--mantine-color-gray-0) dark:bg-(--mantine-color-dark-6)"
          >
            <Group gap="sm">
              <ThemeToggle />

              <ActionIcon
                variant="default"
                size="lg"
                radius="xl"
                aria-label="Notifications"
              >
                <Bell size={18} />
              </ActionIcon>
            </Group>

            <Menu shadow="md" width={200} position="bottom-end">
              <Menu.Target>
                <UnstyledButton className="flex items-center gap-3 rounded-full py-1 pl-1 pr-2 hover:bg-(--mantine-color-default-hover)">
                  <Avatar
                    color="initials"
                    radius="xl"
                    size="md"
                    name={user?.fullName}
                  />
                  <Text size="sm" fw={500}>
                    {user?.fullName ?? 'Admin User'}
                  </Text>
                  <ChevronDown
                    size={16}
                    className="text-(--mantine-color-dimmed)"
                  />
                </UnstyledButton>
              </Menu.Target>
              <Menu.Dropdown>{userMenuItems}</Menu.Dropdown>
            </Menu>
          </Group>
        )}
      </div>
    </div>
  );
}
