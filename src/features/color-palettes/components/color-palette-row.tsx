import {
  Table,
  Text,
  Badge,
  ActionIcon,
  Menu,
  Group,
  ColorSwatch,
} from '@mantine/core';
import { Edit, MoreHorizontal, Trash2, Eye } from 'lucide-react';
import { Link } from '@tanstack/react-router';

import { openDeleteModal } from '@/utils/open-delete-modal';

import { useDeleteColorPalette } from '../api/delete-color-palette';
import type { ColorPalette } from '../types';

type ColorPaletteRowProps = {
  item: ColorPalette;
  onEdit: (item: ColorPalette) => void;
};

export function ColorPaletteRow({ item, onEdit }: ColorPaletteRowProps) {
  const deleteColorPalette = useDeleteColorPalette();

  const handleDelete = (item: ColorPalette) => {
    openDeleteModal({
      entityType: 'Color Palette',
      itemName: item.name,
      onConfirm: () => deleteColorPalette.mutate(item.id),
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
        <Group gap={4}>
          {item.colorPairs.slice(0, 5).map((pair, index) => (
            <ColorSwatch
              key={`${pair.bg}-${index}`}
              color={pair.bg}
              size={20}
            />
          ))}
          {item.colorPairs.length > 5 && (
            <Text size="xs" c="dimmed">
              +{item.colorPairs.length - 5}
            </Text>
          )}
        </Group>
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
              leftSection={<Eye size={14} />}
              component={Link}
              to={`/admin/color-palettes/${item.id}`}
            >
              View
            </Menu.Item>
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
