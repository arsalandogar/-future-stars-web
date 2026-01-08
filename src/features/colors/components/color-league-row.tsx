import { Table, Text, Badge, ActionIcon, Menu } from '@mantine/core';
import { Edit, MoreHorizontal, Trash2 } from 'lucide-react';

import { openDeleteModal } from '@/utils/open-delete-modal';

import { useDeleteColorLeague } from '../api/delete-color-league';
import type { ColorLeague } from '../types';

type ColorLeagueRowProps = {
  item: ColorLeague;
  onEdit: (item: ColorLeague) => void;
};

export function ColorLeagueRow({ item, onEdit }: ColorLeagueRowProps) {
  const deleteColorLeague = useDeleteColorLeague();

  const handleDelete = (item: ColorLeague) => {
    openDeleteModal({
      entityType: 'Color League',
      itemName: item.label,
      onConfirm: () => deleteColorLeague.mutate(item.id),
    });
  };

  return (
    <>
      <Table.Td>
        <Text fw={500} size="sm">
          #{item.id}
        </Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm">{item.name}</Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm">{item.label}</Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm">{item.rank}</Text>
      </Table.Td>
      <Table.Td>
        <Badge
          variant="light"
          color={item.isActive ? 'green' : 'gray'}
          size="xs"
        >
          {item.isActive ? 'Active' : 'Inactive'}
        </Badge>
      </Table.Td>
      <Table.Td>
        <Menu shadow="md" width={160} position="bottom-end">
          <Menu.Target>
            <ActionIcon variant="subtle" color="gray">
              <MoreHorizontal size={16} />
            </ActionIcon>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Item
              leftSection={<Edit size={14} />}
              onClick={() => onEdit(item)}
            >
              Edit
            </Menu.Item>
            <Menu.Item
              leftSection={<Trash2 size={14} />}
              c="red"
              onClick={() => handleDelete(item)}
            >
              Delete
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Table.Td>
    </>
  );
}
