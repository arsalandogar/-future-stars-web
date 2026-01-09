import { Paper, Table, Text } from '@mantine/core';

import { TemplateRow } from '@/features/templates';

import type { TagTemplate } from '../types';

const COLUMNS = [
  { key: 'preview', label: 'Preview', width: 80 },
  { key: 'label', label: 'Label' },
  { key: 'description', label: 'Description' },
  { key: 'created', label: 'Created', width: 150 },
  { key: 'actions', label: 'Actions', width: 60 },
];

interface TagBackTemplatesListProps {
  templates: TagTemplate[];
}

export function TagBackTemplatesList({ templates }: TagBackTemplatesListProps) {
  if (templates.length === 0) {
    return (
      <Text c="dimmed" ta="center" py="xl">
        No back templates associated with this tag
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
        <Table.Tbody>
          {templates.map((template) => (
            <Table.Tr key={template.id}>
              <TemplateRow template={template} side="back" hideTags hideBack />
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </Paper>
  );
}
