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
import { Paper, Table, Text } from '@mantine/core';
import { useQueryClient } from '@tanstack/react-query';

import { useTag } from '../api/get-tag';
import { useReorderTagTemplates } from '../api/reorder-tag-templates';
import type { TagDetailResponse, TagWithTemplates } from '../types';

import { SortableTemplateRow } from './sortable-template-row';

const COLUMNS = [
  { label: '', width: 40 },
  { label: 'Order', width: 60 },
  { label: 'Preview', width: 80 },
  { label: 'Label' },
  { label: 'Description' },
  { label: 'Created', width: 150 },
  { label: 'Actions', width: 60 },
];

interface TagTemplatesListProps {
  tag: TagWithTemplates;
}

export function TagTemplatesList({ tag }: TagTemplatesListProps) {
  const queryClient = useQueryClient();
  const queryKey = useTag.getKey(tag.id);
  const reorderMutation = useReorderTagTemplates();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = tag.templates.findIndex((t) => t.id === active.id);
      const newIndex = tag.templates.findIndex((t) => t.id === over.id);
      const newOrder = arrayMove(tag.templates, oldIndex, newIndex);

      const previousData =
        queryClient.getQueryData<TagDetailResponse>(queryKey);

      queryClient.setQueryData<TagDetailResponse>(queryKey, (old) => {
        if (!old) return old;
        return { ...old, data: { ...old.data, templates: newOrder } };
      });

      reorderMutation.mutate(
        { tagId: tag.id, templateIds: newOrder.map((t) => t.id) },
        {
          onError: () => {
            queryClient.setQueryData(queryKey, previousData);
          },
        }
      );
    }
  };

  if (tag.templates.length === 0) {
    return (
      <Text c="dimmed" ta="center" py="xl">
        No templates associated with this tag
      </Text>
    );
  }

  return (
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
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={tag.templates.map((t) => t.id)}
            strategy={verticalListSortingStrategy}
          >
            <Table.Tbody>
              {tag.templates.map((template) => (
                <SortableTemplateRow key={template.id} template={template} />
              ))}
            </Table.Tbody>
          </SortableContext>
        </DndContext>
      </Table>
    </Paper>
  );
}
