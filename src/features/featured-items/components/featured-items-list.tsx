import { useState } from 'react';
import { Button, Text, Paper, Skeleton, Table } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Plus } from 'lucide-react';

import { type Column } from '@/components/ui/data-table';
import { ListingShell, useListingContext } from '@/components/ui/listing';
import { usePageHeader } from '@/hooks/use-page-header';

import { useFeaturedItems } from '../api/get-featured-items';
import type { FeaturedItem, FeaturedItemsListResponse } from '../types';

import { SortableFeaturedItemRow } from './sortable-featured-item-row';
import { FeaturedItemModal } from './featured-item-modal';
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useQueryClient } from '@tanstack/react-query';
import { useReorderFeaturedItems } from '../api/reorder-featured-items';

const COLUMNS: Column[] = [
  { label: '', width: 40 },
  { label: 'Order', width: 60 },
  { label: 'Image', width: 80 },
  { label: 'Title', width: 150 },
  { label: 'CTA Text', width: 120 },
  { label: 'Template', width: 150 },
  { label: 'Status', width: 90 },
  { label: 'Created At', width: 110 },
  { label: 'Actions', width: 60 },
];

export function FeaturedItemsList() {
  const { search } = useListingContext();
  const [opened, { open, close }] = useDisclosure(false);
  const [selectedItem, setSelectedItem] = useState<FeaturedItem | undefined>();
  const queryClient = useQueryClient();

  usePageHeader({
    title: 'Featured Items',
    description: 'View and manage featured items.',
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleCreate = () => {
    setSelectedItem(undefined);
    open();
  };

  const handleEdit = (item: FeaturedItem) => {
    setSelectedItem(item);
    open();
  };

  const queryResult = useFeaturedItems({
    variables: {
      search: search || undefined,
    },
  });

  const reorderMutation = useReorderFeaturedItems();

  const featuredItem = queryResult.data?.data ?? [];

  const queryKey = useFeaturedItems.getKey({ search: search || undefined });
  const isDragDisabled = Boolean(search);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = featuredItem.findIndex((t) => t.id === active.id);
      const newIndex = featuredItem.findIndex((t) => t.id === over.id);
      const newOrder = arrayMove(featuredItem, oldIndex, newIndex);

      const previousData =
        queryClient.getQueryData<FeaturedItemsListResponse>(queryKey);

      queryClient.setQueryData<FeaturedItemsListResponse>(queryKey, (old) => {
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
      <FeaturedItemModal item={selectedItem} opened={opened} onClose={close} />
      <ListingShell
        actions={
          <Button
            variant="filled"
            leftSection={<Plus size={16} />}
            onClick={handleCreate}
          >
            Create Featured Item
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
                  {Array.from({ length: 7 }).map((_, rowIndex) => (
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
              ) : featuredItem.length === 0 ? (
                <Table.Tbody>
                  <Table.Tr>
                    <Table.Td colSpan={COLUMNS.length}>
                      <Text ta="center" c="dimmed" py="xl">
                        No featured items found
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
                    items={featuredItem.map((t) => t.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <Table.Tbody>
                      {featuredItem.map((item) => (
                        <SortableFeaturedItemRow
                          key={item.id}
                          item={item}
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
