import {
  Group,
  TextInput,
  ActionIcon,
  Avatar,
  Text,
  Stack,
  Burger,
} from '@mantine/core';
import { Search, Bell } from 'lucide-react';

import { useAuthStore } from '@/features/auth';

interface AdminHeaderProps {
  opened: boolean;
  toggle: () => void;
}

export function AdminHeader({ opened, toggle }: AdminHeaderProps) {
  const user = useAuthStore((state) => state.user);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Group h="100%" px="md" justify="space-between">
      <Group>
        <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
        <Group gap="xs">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-sm">
            FS
          </div>
          <Text fw={600} size="lg">
            Future Stars
          </Text>
        </Group>
      </Group>

      <Group gap="md">
        <TextInput
          placeholder="Global search..."
          leftSection={<Search size={16} />}
          w={250}
          radius="md"
          visibleFrom="sm"
        />
        <ActionIcon variant="subtle" color="gray" size="lg">
          <Bell size={20} />
        </ActionIcon>
        <Group gap="sm">
          <Stack gap={0} align="flex-end" visibleFrom="sm">
            <Text size="sm" fw={500}>
              {user?.fullName || 'Admin User'}
            </Text>
            <Text size="xs" c="dimmed">
              {user?.role === 'admin' ? 'Manager' : user?.role || 'Manager'}
            </Text>
          </Stack>
          <Avatar color="blue" radius="xl">
            {user?.fullName ? getInitials(user.fullName) : 'AU'}
          </Avatar>
        </Group>
      </Group>
    </Group>
  );
}
