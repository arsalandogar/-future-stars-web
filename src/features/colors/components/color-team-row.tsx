import {
  Table,
  Text,
  Badge,
  ActionIcon,
  Menu,
  Group,
  ColorSwatch,
} from '@mantine/core';
import { Edit, MoreHorizontal, Trash2 } from 'lucide-react';

import { openDeleteModal } from '@/utils/open-delete-modal';

import { useDeleteColorTeam } from '../api/delete-color-team';
import type { ColorTeam } from '../types';

type ColorTeamRowProps = {
  item: ColorTeam;
  onEdit: (item: ColorTeam) => void;
};

export function ColorTeamRow({ item, onEdit }: ColorTeamRowProps) {
  const deleteColorTeam = useDeleteColorTeam();

  const handleDelete = (item: ColorTeam) => {
    openDeleteModal({
      entityType: 'Color Team',
      itemName: item.name,
      onConfirm: () => deleteColorTeam.mutate(item.id),
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
        <Text size="sm">{item.league?.label ?? '—'}</Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm">{item.name}</Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm" c="dimmed">
          {item.abbreviation}
        </Text>
      </Table.Td>
      <Table.Td>
        {item.palette?.colorPairs ? (
          <Group gap={4}>
            {item.palette.colorPairs.slice(0, 5).map((pair, index) => (
              <ColorSwatch
                key={`${pair.bg}-${index}`}
                color={pair.bg}
                size={20}
              />
            ))}
            {item.palette.colorPairs.length > 5 && (
              <Text size="xs" c="dimmed">
                +{item.palette.colorPairs.length - 5}
              </Text>
            )}
          </Group>
        ) : (
          <Text size="sm" c="dimmed">
            —
          </Text>
        )}
      </Table.Td>
      <Table.Td>
        <Text size="sm">{item.rank}</Text>
      </Table.Td>
      <Table.Td>
        <Badge
          variant="light"
          color={item.isFeatured ? 'blue' : 'gray'}
          size="xs"
        >
          {item.isFeatured ? 'Yes' : 'No'}
        </Badge>
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
