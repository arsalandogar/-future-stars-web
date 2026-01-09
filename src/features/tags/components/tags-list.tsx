import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { Button, Paper, Skeleton, Table, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';

import { ListingShell, useListingContext } from '@/components/ui/listing';
import { usePageHeader } from '@/hooks/use-page-header';
import type { Tag } from '@/types';

import { useTags } from '../api/get-tags';
import { useReorderTags } from '../api/reorder-tags';
import type { TagsListResponse } from '../types';

import { SortableTagRow } from './sortable-tag-row';
import { TagModal } from './tag-modal';

const COLUMNS = [
  { label: '', width: 40 },
  { label: 'Order', width: 60 },
  { label: 'Name', width: 140 },
  { label: 'Label', width: 140 },
  { label: 'Description', width: 300 },
  { label: 'Created At', width: 140 },
  { label: 'Actions', width: 60 },
];

export function TagsList() {
  const { search } = useListingContext();
  const [opened, { open, close }] = useDisclosure(false);
  const [selectedTag, setSelectedTag] = useState<Tag | undefined>();
  const queryClient = useQueryClient();

  usePageHeader({
    title: 'Tags',
    description: 'View and manage tags.',
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleCreate = () => {
    setSelectedTag(undefined);
    open();
  };

  const handleEdit = (tag: Tag) => {
    setSelectedTag(tag);
    open();
  };

  const queryKey = useTags.getKey({ search: search || undefined });

  const queryResult = useTags({
    variables: {
      search: search || undefined,
    },
  });

  const reorderMutation = useReorderTags();

  const tags = queryResult.data?.data ?? [];
  const isDragDisabled = Boolean(search);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = tags.findIndex((t) => t.id === active.id);
      const newIndex = tags.findIndex((t) => t.id === over.id);
      const newOrder = arrayMove(tags, oldIndex, newIndex);

      const previousData = queryClient.getQueryData<TagsListResponse>(queryKey);

      queryClient.setQueryData<TagsListResponse>(queryKey, (old) => {
        if (!old) return old;
        return { ...old, data: newOrder };
      });

      reorderMutation.mutate(
        newOrder.map((t) => t.id),
        {
          onError: () => {
            queryClient.setQueryData(queryKey, previousData);
          },
        }
      );
    }
  };

  return (
    <>
      <TagModal tag={selectedTag} opened={opened} onClose={close} />
      <ListingShell
        actions={
          <Button
            variant="filled"
            leftSection={<Plus size={16} />}
            onClick={handleCreate}
          >
            Create Tag
          </Button>
        }
      >
        <div className="flex flex-col gap-4">
          <Paper withBorder radius="md">
            <Table horizontalSpacing="md" verticalSpacing="sm">
              <Table.Thead>
                <Table.Tr>
                  {COLUMNS.map((column) => (
                    <Table.Th key={column.label || 'drag'} w={column.width}>
                      {column.label}
                    </Table.Th>
                  ))}
                </Table.Tr>
              </Table.Thead>
              {queryResult.isLoading ? (
                <Table.Tbody>
                  {Array.from({ length: 5 }).map((_, rowIndex) => (
                    // eslint-disable-next-line react-x/no-array-index-key
                    <Table.Tr key={rowIndex}>
                      {COLUMNS.map((column) => (
                        <Table.Td key={column.label || 'drag'}>
                          <Skeleton height={20} width={column.width ?? '70%'} />
                        </Table.Td>
                      ))}
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              ) : tags.length === 0 ? (
                <Table.Tbody>
                  <Table.Tr>
                    <Table.Td colSpan={COLUMNS.length}>
                      <Text ta="center" c="dimmed" py="xl">
                        No tags found
                      </Text>
                    </Table.Td>
                  </Table.Tr>
                </Table.Tbody>
              ) : (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={tags.map((t) => t.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <Table.Tbody>
                      {tags.map((tag) => (
                        <SortableTagRow
                          key={tag.id}
                          tag={tag}
                          onEdit={handleEdit}
                          isDragDisabled={isDragDisabled}
                        />
                      ))}
                    </Table.Tbody>
                  </SortableContext>
                </DndContext>
              )}
            </Table>
          </Paper>
        </div>
      </ListingShell>
    </>
  );
}
