import { ActionIcon, Badge, Group, Text, Tooltip } from '@mantine/core';
import { modals } from '@mantine/modals';
import { Download, Redo2, RotateCcw, Save, Undo2, Wand2 } from 'lucide-react';

import { EDITABLE_FIELDS } from '@/features/templates';

import { useAnnotatorStore } from '../stores/annotator-store';
import { isFieldCompatible } from '../utils/svg-node-helpers';

interface AnnotatorToolbarProps {
  onExport: () => void;
  onDetect: () => void;
  onSave?: () => void;
  isSaving?: boolean;
}

export function AnnotatorToolbar({
  onExport,
  onDetect,
  onSave,
  isSaving,
}: AnnotatorToolbarProps) {
  const fileName = useAnnotatorStore((s) => s.fileName);
  const assignments = useAnnotatorStore((s) => s.assignments);
  const nodeIndex = useAnnotatorStore((s) => s.nodeIndex);
  const undoStack = useAnnotatorStore((s) => s.undoStack);
  const redoStack = useAnnotatorStore((s) => s.redoStack);
  const undo = useAnnotatorStore((s) => s.undo);
  const redo = useAnnotatorStore((s) => s.redo);
  const reset = useAnnotatorStore((s) => s.reset);

  // Count total assignable fields across all nodes
  const totalAssignable = (() => {
    const allFieldIds = Object.keys(EDITABLE_FIELDS) as Array<
      keyof typeof EDITABLE_FIELDS
    >;
    const assignable = new Set<string>();
    for (const [, meta] of nodeIndex) {
      for (const fieldId of allFieldIds) {
        if (isFieldCompatible(fieldId, meta)) {
          assignable.add(fieldId);
        }
      }
    }
    return assignable.size;
  })();

  const handleReset = () => {
    modals.openConfirmModal({
      title: 'Reset all assignments?',
      children: (
        <Text size="sm">
          This will remove all {assignments.length} field assignments. This
          action cannot be undone.
        </Text>
      ),
      labels: { confirm: 'Reset', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      onConfirm: reset,
    });
  };

  return (
    <Group justify="space-between" px="md" py="xs">
      <Group gap="sm">
        <Text fw={600} size="sm" truncate maw={200} ff="monospace">
          {fileName}
        </Text>
        <Badge variant="light" size="sm" color="primary">
          {assignments.length}
          {totalAssignable > 0 ? ` / ${totalAssignable}` : ''} field
          {assignments.length !== 1 ? 's' : ''} assigned
        </Badge>
      </Group>

      <Group gap="xs">
        <Tooltip label="Reset all assignments" color="red">
          <ActionIcon
            variant="subtle"
            color="red"
            onClick={handleReset}
            disabled={assignments.length === 0}
            size="md"
          >
            <RotateCcw size={18} />
          </ActionIcon>
        </Tooltip>

        <div className="mx-1 h-5 w-px bg-(--mantine-color-default-border)" />

        <div className="flex items-center gap-1.5 rounded-full bg-(--mantine-color-gray-1) px-2 py-0.5 dark:bg-(--mantine-color-dark-6)">
          <Tooltip label="Undo">
            <ActionIcon
              variant="subtle"
              onClick={undo}
              disabled={undoStack.length === 0}
              size="md"
            >
              <Undo2 size={18} />
            </ActionIcon>
          </Tooltip>

          <Tooltip label="Redo">
            <ActionIcon
              variant="subtle"
              onClick={redo}
              disabled={redoStack.length === 0}
              size="md"
            >
              <Redo2 size={18} />
            </ActionIcon>
          </Tooltip>

          <Tooltip label="Auto-Detect">
            <ActionIcon variant="subtle" onClick={onDetect} size="md">
              <Wand2 size={18} />
            </ActionIcon>
          </Tooltip>

          {onSave && (
            <Tooltip label="Save">
              <ActionIcon
                variant="filled"
                color="primary"
                onClick={onSave}
                disabled={assignments.length === 0}
                loading={isSaving}
                size="md"
              >
                <Save size={18} />
              </ActionIcon>
            </Tooltip>
          )}

          <Tooltip label="Export JSON">
            <ActionIcon
              variant="light"
              color="primary"
              onClick={onExport}
              disabled={assignments.length === 0}
              size="md"
            >
              <Download size={18} />
            </ActionIcon>
          </Tooltip>
        </div>
      </Group>
    </Group>
  );
}
