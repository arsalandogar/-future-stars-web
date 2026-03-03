import { ActionIcon, Badge, Group, Text, Tooltip } from '@mantine/core';
import { Download, Redo2, RotateCcw, Save, Undo2, Wand2 } from 'lucide-react';

import { useAnnotatorStore } from '../stores/annotator-store';

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
  const undoStack = useAnnotatorStore((s) => s.undoStack);
  const redoStack = useAnnotatorStore((s) => s.redoStack);
  const undo = useAnnotatorStore((s) => s.undo);
  const redo = useAnnotatorStore((s) => s.redo);
  const reset = useAnnotatorStore((s) => s.reset);

  return (
    <Group justify="space-between" px="md" py="xs">
      <Group gap="sm">
        <Text fw={600} size="sm" truncate maw={200} ff="monospace">
          {fileName}
        </Text>
        <Badge variant="light" size="sm" color="primary">
          {assignments.length} field{assignments.length !== 1 ? 's' : ''}{' '}
          assigned
        </Badge>
      </Group>

      <div className="flex items-center gap-1 rounded-full bg-(--mantine-color-gray-1) px-1.5 py-0.5 dark:bg-(--mantine-color-dark-6)">
        <Tooltip label="Undo">
          <ActionIcon
            variant="subtle"
            onClick={undo}
            disabled={undoStack.length === 0}
            size="sm"
          >
            <Undo2 size={14} />
          </ActionIcon>
        </Tooltip>

        <Tooltip label="Redo">
          <ActionIcon
            variant="subtle"
            onClick={redo}
            disabled={redoStack.length === 0}
            size="sm"
          >
            <Redo2 size={14} />
          </ActionIcon>
        </Tooltip>

        <Tooltip label="Auto-Detect">
          <ActionIcon variant="subtle" onClick={onDetect} size="sm">
            <Wand2 size={14} />
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
              size="sm"
            >
              <Save size={14} />
            </ActionIcon>
          </Tooltip>
        )}

        <Tooltip label="Export JSON">
          <ActionIcon
            variant="light"
            color="primary"
            onClick={onExport}
            disabled={assignments.length === 0}
            size="sm"
          >
            <Download size={14} />
          </ActionIcon>
        </Tooltip>

        <Tooltip label="Reset">
          <ActionIcon variant="subtle" color="red" onClick={reset} size="sm">
            <RotateCcw size={14} />
          </ActionIcon>
        </Tooltip>
      </div>
    </Group>
  );
}
