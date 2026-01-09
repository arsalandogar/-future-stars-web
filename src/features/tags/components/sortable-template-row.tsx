import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ActionIcon, Table } from '@mantine/core';
import { GripVertical } from 'lucide-react';

import { TemplateRow } from '@/features/templates';

import type { TagTemplate } from '../types';

interface SortableTemplateRowProps {
  template: TagTemplate;
}

export function SortableTemplateRow({ template }: SortableTemplateRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: template.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Table.Tr ref={setNodeRef} style={style}>
      <Table.Td>
        <ActionIcon
          variant="subtle"
          color="gray"
          style={{ cursor: 'grab' }}
          {...attributes}
          {...listeners}
        >
          <GripVertical size={16} />
        </ActionIcon>
      </Table.Td>

      <Table.Td>{template.pivotDisplayOrder}</Table.Td>

      <TemplateRow template={template} side={template.side} hideTags hideBack />
    </Table.Tr>
  );
}
