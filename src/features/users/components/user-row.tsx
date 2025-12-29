import { ActionIcon, Menu, Table, Text } from '@mantine/core';
import { Eye, MoreHorizontal } from 'lucide-react';

import { MappedBadge } from '@/components/ui/mapped-badge';
import type { User } from '@/types';
import { formatDate } from '@/utils/date';

import { USER_ROLE_COLORS } from '../constants';

interface UserRowProps {
  user: User;
}

export function UserRow({ user }: UserRowProps) {
  return (
    <>
      <Table.Td>
        <Text size="sm" fw={500}>
          #{user.id}
        </Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm">{user.fullName}</Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm">{user.email}</Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm">{user.phone || '-'}</Text>
      </Table.Td>
      <Table.Td>
        <MappedBadge value={user.role} colorMap={USER_ROLE_COLORS} />
      </Table.Td>
      <Table.Td>
        <Text size="sm">{formatDate(user.createdAt)}</Text>
      </Table.Td>
      <Table.Td>
        <Menu shadow="md" width={160} position="bottom-end">
          <Menu.Target>
            <ActionIcon variant="subtle" color="gray">
              <MoreHorizontal size={16} />
            </ActionIcon>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Item leftSection={<Eye size={14} />}>View Details</Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Table.Td>
    </>
  );
}
