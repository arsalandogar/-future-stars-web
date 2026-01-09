import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Table, Text, Badge, ActionIcon, Menu } from '@mantine/core';
import dayjs from 'dayjs';
import { Edit, GripVertical, MoreHorizontal, Trash2 } from 'lucide-react';

import { openDeleteModal } from '@/utils/open-delete-modal';
import type { Tag } from '@/types';

import { useDeleteTag } from '../api/delete-tag';

type SortableTagRowProps = {
  tag: Tag;
  onEdit: (tag: Tag) => void;
  isDragDisabled?: boolean;
};

export function SortableTagRow({
  tag,
  onEdit,
  isDragDisabled,
}: SortableTagRowProps) {
  const deleteTag = useDeleteTag();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: tag.id,
    disabled: isDragDisabled,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleDelete = (tag: Tag) => {
    openDeleteModal({
      entityType: 'Tag',
      itemName: tag.name,
      onConfirm: () => deleteTag.mutate(tag.id),
    });
  };

  return (
    <Table.Tr ref={setNodeRef} style={style}>
      <Table.Td>
        <ActionIcon
          variant="subtle"
          color="gray"
          style={{ cursor: isDragDisabled ? 'not-allowed' : 'grab' }}
          disabled={isDragDisabled}
          {...attributes}
          {...listeners}
        >
          <GripVertical size={16} />
        </ActionIcon>
      </Table.Td>

      <Table.Td>{tag.displayOrder ?? '—'}</Table.Td>

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
    </Table.Tr>
  );
}
