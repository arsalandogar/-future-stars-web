import { ActionIcon, Badge, Group, Text, Tooltip } from '@mantine/core';
import { Trash2 } from 'lucide-react';

import { EDITABLE_FIELDS } from '@/features/templates';

import { useAnnotatorStore } from '../stores/annotator-store';

import styles from './assignment-summary-table.module.css';

export function AssignmentSummaryTable() {
  const assignments = useAnnotatorStore((s) => s.assignments);
  const nodeIndex = useAnnotatorStore((s) => s.nodeIndex);
  const selectNode = useAnnotatorStore((s) => s.selectNode);
  const removeAssignment = useAnnotatorStore((s) => s.removeAssignment);

  if (assignments.length === 0) {
    return (
      <Text size="sm" c="dimmed" ta="center" py="xl">
        No fields assigned yet.
      </Text>
    );
  }

  return (
    <div className={styles.list}>
      {assignments.map((a) => {
        const field = EDITABLE_FIELDS[a.fieldId];
        const meta = nodeIndex.get(a.nodeId);

        return (
          <div
            key={`${a.nodeId}-${a.fieldId}`}
            className={styles.card}
            onClick={() => selectNode(a.nodeId)}
          >
            <div className={styles.cardHeader}>
              <Text size="sm" fw={600} truncate>
                {field.label}
              </Text>
              <Group gap={4} wrap="nowrap" className="flex-shrink-0">
                <Badge size="xs" variant="light">
                  {field.type}
                </Badge>
                {a.colorTarget && (
                  <Badge size="xs" variant="outline">
                    {a.colorTarget}
                  </Badge>
                )}
              </Group>
            </div>

            <div className={styles.cardElement}>
              {meta ? `<${meta.tagName}> ${meta.label}` : a.nodeId}
            </div>

            {field.type === 'text' &&
              (a.maxWidth != null || a.maxHeight != null) && (
                <Text size="xs" c="dimmed" mt={2}>
                  {a.maxWidth ?? '–'} × {a.maxHeight ?? '–'}
                </Text>
              )}

            <Tooltip label="Remove">
              <ActionIcon
                variant="subtle"
                color="red"
                size="sm"
                className={styles.deleteButton}
                onClick={(e) => {
                  e.stopPropagation();
                  removeAssignment(a.nodeId, a.fieldId);
                }}
              >
                <Trash2 size={14} />
              </ActionIcon>
            </Tooltip>
          </div>
        );
      })}
    </div>
  );
}
