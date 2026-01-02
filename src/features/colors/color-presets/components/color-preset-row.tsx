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

import { useDeleteColorPreset } from '../api/delete-color-preset';
import type { ColorPreset } from '../types';
import { openDeleteModal } from '@/utils/open-delete-modal';

type ColorPresetRowProps = {
  item: ColorPreset;
  onEdit: (item: ColorPreset) => void;
};

export function ColorPresetRow({ item, onEdit }: ColorPresetRowProps) {
  const deleteColorPreset = useDeleteColorPreset();

  const handleDelete = (item: ColorPreset) => {
    openDeleteModal({
      entityType: 'Color Preset',
      itemName: item.name,
      onConfirm: () => deleteColorPreset.mutate(item.id),
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
        <Group gap={4}>
          {item.colors.slice(0, 5).map((color) => (
            <ColorSwatch key={color} color={color} size={20} />
          ))}
          {item.colors.length > 5 && (
            <Text size="xs" c="dimmed">
              +{item.colors.length - 5}
            </Text>
          )}
        </Group>
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
