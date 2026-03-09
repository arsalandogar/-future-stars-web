import {
  ActionIcon,
  Button,
  Group,
  SegmentedControl,
  SimpleGrid,
  Text,
  Tooltip,
} from '@mantine/core';
import { AlignCenter, AlignLeft, AlignRight, RotateCcw } from 'lucide-react';

import type { EditableFieldId } from '@/features/templates';

import type { NodeMeta, TextAlign, SvgTextAnchor } from '../types';
import { TEXT_ANCHOR_TO_ALIGN } from '../types';
import { useAnnotatorStore } from '../stores/annotator-store';
import {
  ensureTextDimensions,
  resetTextDimensions,
} from '../utils/text-area-helpers';

const ALIGN_OPTIONS = [
  {
    value: 'left',
    label: <AlignLeft size={14} />,
  },
  {
    value: 'center',
    label: <AlignCenter size={14} />,
  },
  {
    value: 'right',
    label: <AlignRight size={14} />,
  },
];

interface TextAreaControlsProps {
  nodeMeta: NodeMeta;
  fieldId: EditableFieldId;
}

export function TextAreaControls({ nodeMeta, fieldId }: TextAreaControlsProps) {
  const isEditing = useAnnotatorStore(
    (s) => s.editingTextAreaNodeId === nodeMeta.nodeId
  );
  const setEditing = useAnnotatorStore((s) => s.setEditingTextArea);
  const setTextAlign = useAnnotatorStore((s) => s.setTextAlign);

  const assignment = useAnnotatorStore((s) =>
    s.assignments.find(
      (a) => a.nodeId === nodeMeta.nodeId && a.fieldId === fieldId
    )
  );

  const currentAlign: TextAlign = useAnnotatorStore((s) => {
    const a = s.assignments.find(
      (a) => a.nodeId === nodeMeta.nodeId && a.fieldId === fieldId
    );
    if (a?.textAlign) return a.textAlign;
    const node = s.nodeMap.get(nodeMeta.nodeId);
    if (node?.type === 'element') {
      const anchor = node.attributes['text-anchor'];
      if (anchor && anchor in TEXT_ANCHOR_TO_ALIGN) {
        return TEXT_ANCHOR_TO_ALIGN[anchor as SvgTextAnchor];
      }
    }
    return 'left';
  });

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

  const handleAlignChange = (value: string) => {
    setTextAlign(nodeMeta.nodeId, fieldId, value as TextAlign);
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
      <SegmentedControl
        size="xs"
        value={currentAlign}
        onChange={handleAlignChange}
        data={ALIGN_OPTIONS}
        mt="xs"
      />
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
