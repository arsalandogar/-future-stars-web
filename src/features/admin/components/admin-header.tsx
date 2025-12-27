import {
  Group,
  Burger,
  TextInput,
  ActionIcon,
  Avatar,
  Menu,
  UnstyledButton,
  Text,
  Kbd,
} from '@mantine/core';
import {
  Search,
  Moon,
  Bell,
  ChevronDown,
  MoreVertical,
  User,
  LogOut,
} from 'lucide-react';

import { useAuth, useAuthStore } from '@/features/auth';

import { Logo } from './logo';
import { useHeaderStore } from '../stores/header-store';

interface AdminHeaderProps {
  opened: boolean;
  toggle: () => void;
}

export function AdminHeader({ opened, toggle }: AdminHeaderProps) {
  const { mobileMenuOpen, toggleMobileMenu } = useHeaderStore();
  const { logout } = useAuth();
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
            <Search size={16} className="text-(--mantine-color-gray-5)" />
          }
          rightSection={
            <Group gap={4}>
              <Kbd size="xs">⌘</Kbd>
              <Kbd size="xs">K</Kbd>
            </Group>
          }
          rightSectionWidth={60}
        />
        <Group gap="sm">
          <ActionIcon
            variant="default"
            size="lg"
            radius="xl"
            aria-label="Toggle theme"
          >
            <Moon size={18} />
          </ActionIcon>

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
              <UnstyledButton className="flex items-center gap-2 rounded-full py-1 pl-1 pr-3 hover:bg-(--mantine-color-gray-1)">
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
                  className="text-(--mantine-color-gray-6)"
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

          <Group gap="xs">
            <Logo />
            <Text fw={600} size="md">
              Future Stars
            </Text>
          </Group>

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
            className="border-t border-(--mantine-color-gray-3) bg-(--mantine-color-gray-0)"
          >
            <Group gap="sm">
              <ActionIcon
                variant="default"
                size="lg"
                radius="xl"
                aria-label="Toggle theme"
              >
                <Moon size={18} />
              </ActionIcon>

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
                <UnstyledButton className="flex items-center gap-3 rounded-full py-1 pl-1 pr-2 hover:bg-(--mantine-color-gray-2)">
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
                    className="text-(--mantine-color-gray-6)"
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
