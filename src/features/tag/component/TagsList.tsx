import { useState } from 'react';
import {
  Table,
  Text,
  Badge,
  Group,
  ActionIcon,
  Stack,
  Pagination,
  Box,
} from '@mantine/core';
import { Pencil, Trash } from 'lucide-react';
import dayjs from 'dayjs';
import type { Tag } from '../types';
import { useTagsMutations } from '../api/tag';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';

type TagsListProps = {
  tags?: Tag[];
  onEdit: (tag: Tag) => void;
};

export default function TagsList({ tags = [], onEdit }: TagsListProps) {
  const { deleteTag } = useTagsMutations();

  // --- Pagination Logic ---
  const [activePage, setPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(tags.length / itemsPerPage);

  // Slice data for current page
  const displayedTags = tags.slice(
    (activePage - 1) * itemsPerPage,
    activePage * itemsPerPage
  );

  const handleDelete = (tag: Tag) => {
    modals.openConfirmModal({
      title: <Text fw={700}>Delete Tag</Text>,
      centered: true,
      children: (
        <Text size="sm">
          Are you sure you want to delete the tag <b>{tag.name}</b>? This action
          cannot be undone.
        </Text>
      ),
      labels: { confirm: 'Delete Tag', cancel: 'Cancel' },
      confirmProps: { color: 'red', loading: deleteTag.isPending },
      onConfirm: async () => {
        try {
          await deleteTag.mutateAsync(tag.id);
          notifications.show({
            title: 'Deleted',
            message: 'Tag removed successfully',
            color: 'green',
          });
        } catch (error) {
          notifications.show({
            title: 'Error',
            message: 'Failed to delete tag',
            color: 'red',
          });
        }
      },
    });
  };

  return (
    <Box mt="md">
      <Table.ScrollContainer minWidth={800}>
        <Table verticalSpacing="sm" highlightOnHover withTableBorder>
          <Table.Thead bg="var(--mantine-color-gray-0)">
            <Table.Tr>
              <Table.Th>Name</Table.Th>
              <Table.Th>Label</Table.Th>
              <Table.Th>Description</Table.Th>
              <Table.Th>Created</Table.Th>
              <Table.Th>Updated</Table.Th>
              <Table.Th style={{ width: 80 }}>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>

          <Table.Tbody>
            {displayedTags.length > 0 ? (
              displayedTags.map((tag) => (
                <Table.Tr key={tag.id}>
                  <Table.Td>
                    <Text fw={500} size="sm">
                      {tag.name}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Badge variant="light" size="xs">
                      {tag.label}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm" c="dimmed" lineClamp={1} maw={200}>
                      {tag.description || '—'}
                    </Text>
                  </Table.Td>
                  {/* ... Created By Td ... */}
                  <Table.Td>
                    <Stack gap={0}>
                      <Text size="xs" fw={500}>
                        {tag.createdBy}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {dayjs(tag.createdAt).format('MMM DD, YYYY')}
                      </Text>
                    </Stack>
                  </Table.Td>
                  {/* ... Updated By Td ... */}
                  <Table.Td>
                    <Stack gap={0}>
                      <Text size="xs" fw={500}>
                        {tag.updatedBy || tag.createdBy}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {tag.updatedAt
                          ? dayjs(tag.updatedAt).format('MMM DD, YYYY')
                          : '—'}
                      </Text>
                    </Stack>
                  </Table.Td>

                  <Table.Td>
                    <Group gap={4} justify="flex-end" wrap="nowrap">
                      <ActionIcon
                        variant="subtle"
                        color="blue"
                        onClick={() => onEdit(tag)}
                      >
                        <Pencil size={16} />
                      </ActionIcon>
                      <ActionIcon
                        variant="subtle"
                        color="red"
                        onClick={() => handleDelete(tag)}
                      >
                        <Trash size={16} />
                      </ActionIcon>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))
            ) : (
              <Table.Tr>
                <Table.Td colSpan={6}>
                  <Text ta="center" c="dimmed" py="xl">
                    No tags found
                  </Text>
                </Table.Td>
              </Table.Tr>
            )}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>

      {/* --- Native Looking Pagination Footer --- */}
      {/* {totalPages > 1 && (
        <Group justify="flex-end" py="md" px="xs">
          <Text size="xs" c="dimmed">
            Showing {(activePage - 1) * itemsPerPage + 1} to{' '}
            {Math.min(activePage * itemsPerPage, tags.length)} of {tags.length}
          </Text>
          <Pagination
            total={totalPages}
            value={activePage}
            onChange={setPage}
            size="sm"
            radius="md"
            withEdges
          />
        </Group>
      )} */}
    </Box>
  );
}
