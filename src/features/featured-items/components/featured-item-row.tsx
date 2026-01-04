import {
  Table,
  Text,
  Badge,
  ActionIcon,
  Menu,
  Image,
  Anchor,
} from '@mantine/core';
import { Edit, MoreHorizontal, Trash2 } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import dayjs from 'dayjs';
import type { FeaturedItem } from '../types';
import { openDeleteModal } from '@/utils/open-delete-modal';
import { useDeleteFeaturedItem } from '../api/delete-featured-item';

type FeaturedItemRowProps = {
  item: FeaturedItem;
  onEdit: (item: FeaturedItem) => void;
};

export function FeaturedItemRow({ item, onEdit }: FeaturedItemRowProps) {
  const deleteFeaturedItem = useDeleteFeaturedItem();

  const handleDelete = (item: FeaturedItem) => {
    openDeleteModal({
      entityType: 'Featured Item',
      itemName: item.title,
      onConfirm: () => deleteFeaturedItem.mutate(item.id),
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
        {item.imageUrl ? (
          <Image src={item.imageUrl} w={60} h={40} radius="sm" fit="cover" />
        ) : (
          <Text size="sm" c="dimmed">
            —
          </Text>
        )}
      </Table.Td>
      <Table.Td>
        <Text size="sm">{item.title}</Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm" c="dimmed" lineClamp={1}>
          {item.ctaText || '—'}
        </Text>
      </Table.Td>
      <Table.Td>
        {item.template ? (
          <Anchor
            component={Link}
            to={`/admin/templates/${item.template.id}`}
            size="sm"
          >
            {item.template.label || item.template.name}
          </Anchor>
        ) : (
          <Text size="sm" c="dimmed">
            —
          </Text>
        )}
      </Table.Td>
      <Table.Td>
        <Text size="sm">{item.displayOrder}</Text>
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
        <Text size="xs">{dayjs(item.createdAt).format('MMM DD, YYYY')}</Text>
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
              c={'red'}
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
