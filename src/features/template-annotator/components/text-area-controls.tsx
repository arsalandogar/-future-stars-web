import {
  ActionIcon,
  Button,
  Group,
  SimpleGrid,
  Text,
  Tooltip,
} from '@mantine/core';
import { RotateCcw } from 'lucide-react';

import type { EditableFieldId } from '@/features/templates';

import type { NodeMeta } from '../types';
import { useAnnotatorStore } from '../stores/annotator-store';
import {
  ensureTextDimensions,
  resetTextDimensions,
} from '../utils/text-area-helpers';

interface TextAreaControlsProps {
  nodeMeta: NodeMeta;
  fieldId: EditableFieldId;
}

export function TextAreaControls({ nodeMeta, fieldId }: TextAreaControlsProps) {
  const editingNodeId = useAnnotatorStore((s) => s.editingTextAreaNodeId);
  const setEditing = useAnnotatorStore((s) => s.setEditingTextArea);
  const assignments = useAnnotatorStore((s) => s.assignments);

  const assignment = assignments.find(
    (a) => a.nodeId === nodeMeta.nodeId && a.fieldId === fieldId
  );
  const isEditing = editingNodeId === nodeMeta.nodeId;

  const handleToggleEdit = () => {
    if (isEditing) {
      setEditing(null);
    } else {
      ensureTextDimensions(nodeMeta.nodeId, fieldId);
      setEditing(nodeMeta.nodeId);
    }
  };

  const handleReset = () => {
    resetTextDimensions(nodeMeta.nodeId, fieldId);
  };

  const hasDimensions =
    assignment?.maxWidth != null && assignment?.maxHeight != null;

  return (
    <div>
      <Text size="xs" c="dimmed" tt="uppercase" fw={600} mb={4}>
        Text Area
      </Text>
      <Group gap="xs">
        <Button
          size="xs"
          variant={isEditing ? 'filled' : 'light'}
          color="teal"
          onClick={handleToggleEdit}
        >
          {isEditing ? 'Done' : 'Edit Text Area'}
        </Button>
        {hasDimensions && (
          <Tooltip label="Reset to element bounds">
            <ActionIcon
              size="sm"
              variant="subtle"
              color="gray"
              onClick={handleReset}
            >
              <RotateCcw size={14} />
            </ActionIcon>
          </Tooltip>
        )}
      </Group>
      {hasDimensions && (
        <SimpleGrid cols={2} spacing={4} mt="xs">
          <Text size="xs" c="dimmed" ta="center">
            <Text span tt="uppercase" fw={600}>
              Max W
            </Text>{' '}
            {assignment.maxWidth}
          </Text>
          <Text size="xs" c="dimmed" ta="center">
            <Text span tt="uppercase" fw={600}>
              Max H
            </Text>{' '}
            {assignment.maxHeight}
          </Text>
        </SimpleGrid>
      )}
    </div>
  );
}
