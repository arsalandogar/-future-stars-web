import { Table, Text, Badge, ActionIcon, Menu } from '@mantine/core';
import { Edit, MoreHorizontal, Trash2 } from 'lucide-react';
import dayjs from 'dayjs';
import type { Tag } from '@/types';
import { openDeleteModal } from '@/utils/open-delete-modal';
import { useDeleteTag } from '../api/delete-tag';

type TagRowProps = {
  tag: Tag;
  onEdit: (tag: Tag) => void;
};

export function TagRow({ tag, onEdit }: TagRowProps) {
  const deleteTag = useDeleteTag();

  const handleDelete = (tag: Tag) => {
    openDeleteModal({
      entityType: 'Tag',
      itemName: tag.name,
      onConfirm: () => deleteTag.mutate(tag.id),
    });
  };

  return (
    <>
      <Table.Td>
        <Text fw={500} size="sm">
          #{tag.id}
        </Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm">{tag.name}</Text>
      </Table.Td>

      <Table.Td>
        <Badge variant="light" size="xs">
          {tag.label}
        </Badge>
      </Table.Td>

      <Table.Td>
        <Text size="sm" c="dimmed" lineClamp={1}>
          {tag.description || '—'}
        </Text>
      </Table.Td>

      <Table.Td>
        <Text size="xs">{dayjs(tag.createdAt).format('MMM DD, YYYY')}</Text>
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
              onClick={() => onEdit(tag)}
            >
              Edit Tag
            </Menu.Item>
            <Menu.Item
              leftSection={<Trash2 size={14} />}
              c={'red'}
              onClick={() => handleDelete(tag)}
            >
              Delete Tag
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Table.Td>
    </>
  );
}
