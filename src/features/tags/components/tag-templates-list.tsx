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
import type {
  TagDetailResponse,
  TagTemplate,
  TagWithTemplates,
} from '../types';

import { SortableTemplateRow } from './sortable-template-row';

const COLUMNS = [
  { key: 'drag', label: '', width: 40 },
  { key: 'order', label: 'Order', width: 60 },
  { key: 'preview', label: 'Preview', width: 80 },
  { key: 'label', label: 'Label' },
  { key: 'published', label: 'Published', width: 80 },
  { key: 'description', label: 'Description' },
  { key: 'created', label: 'Created', width: 150 },
  { key: 'actions', label: 'Actions', width: 60 },
];

interface TagTemplatesListProps {
  tag: TagWithTemplates;
  templates: TagTemplate[];
}

export function TagTemplatesList({ tag, templates }: TagTemplatesListProps) {
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
      const oldIndex = templates.findIndex((t) => t.id === active.id);
      const newIndex = templates.findIndex((t) => t.id === over.id);
      const reorderedFront = arrayMove(templates, oldIndex, newIndex);

      const previousData =
        queryClient.getQueryData<TagDetailResponse>(queryKey);

      void queryClient.cancelQueries({ queryKey });

      // Preserve back templates, only reorder front templates
      const backTemplates = tag.templates.filter((t) => t.side === 'back');
      const newOrder = [...reorderedFront, ...backTemplates];

      queryClient.setQueryData<TagDetailResponse>(queryKey, (old) => {
        if (!old) return old;
        return { ...old, data: { ...old.data, templates: newOrder } };
      });

      reorderMutation.mutate(
        { tagId: tag.id, templateIds: reorderedFront.map((t) => t.id) },
        {
          onError: () => {
            queryClient.setQueryData(queryKey, previousData);
          },
          onSettled: () => {
            void queryClient.invalidateQueries({ queryKey });
          },
        }
      );
    }
  };

  if (templates.length === 0) {
    return (
      <Text c="dimmed" ta="center" py="xl">
        No front templates associated with this tag
      </Text>
    );
  }

  return (
    <Paper withBorder radius="md">
      <Table horizontalSpacing="md" verticalSpacing="sm">
        <Table.Thead>
          <Table.Tr>
            {COLUMNS.map((column) => (
              <Table.Th key={column.key} w={column.width}>
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
            items={templates.map((t) => t.id)}
            strategy={verticalListSortingStrategy}
          >
            <Table.Tbody>
              {templates.map((template) => (
                <SortableTemplateRow key={template.id} template={template} />
              ))}
            </Table.Tbody>
          </SortableContext>
        </DndContext>
      </Table>
    </Paper>
  );
}
