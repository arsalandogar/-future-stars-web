import { ActionIcon, Button, Group, Stack, Text, Tooltip } from '@mantine/core';
import { RotateCcw, Trash2 } from 'lucide-react';

import type { EditableFieldId } from '@/features/templates';

import type { NodeMeta } from '../types';
import { useAnnotatorStore } from '../stores/annotator-store';
import { BoundsDisplay } from './bounds-display';
import { getElementBBoxInSvgRoot } from '../utils/get-element-bbox';
import { MIN_SIZE, querySvgElement } from '../utils/svg-overlay-helpers';
import { ensureTouchBounds } from '../utils/touch-bounds-helpers';
import { NumericInputGrid } from './numeric-input-grid';

interface TouchBoundsControlsProps {
  nodeMeta: NodeMeta;
  fieldId: EditableFieldId;
}

export function TouchBoundsControls({
  nodeMeta,
  fieldId,
}: TouchBoundsControlsProps) {
  const editingNodeId = useAnnotatorStore((s) => s.editingTouchBoundsNodeId);
  const setEditing = useAnnotatorStore((s) => s.setEditingTouchBounds);
  const commitTouchBounds = useAnnotatorStore((s) => s.commitTouchBounds);
  const removeTouchBounds = useAnnotatorStore((s) => s.removeTouchBounds);
  const assignments = useAnnotatorStore((s) => s.assignments);

  const assignment = assignments.find(
    (a) => a.nodeId === nodeMeta.nodeId && a.fieldId === fieldId
  );
  const hasBounds = !!assignment?.touchBounds;
  const isEditing = editingNodeId === nodeMeta.nodeId;
  const touchBounds = assignment?.touchBounds;

  const handleToggleEdit = () => {
    if (isEditing) {
      setEditing(null);
    } else {
      ensureTouchBounds(nodeMeta.nodeId, fieldId);
      setEditing(nodeMeta.nodeId);
    }
  };

  const handleReset = () => {
    const svgElement = querySvgElement();
    if (!svgElement) return;
    const bbox = getElementBBoxInSvgRoot(svgElement, nodeMeta.nodeId);
    if (bbox) {
      commitTouchBounds(nodeMeta.nodeId, fieldId, bbox);
    }
  };

  const handleRemove = () => {
    removeTouchBounds(nodeMeta.nodeId, fieldId);
    if (isEditing) setEditing(null);
  };

  return (
    <div>
      <Text size="xs" c="dimmed" tt="uppercase" fw={600} mb={4}>
        Touch Area
      </Text>
      <Stack gap="xs">
        <Group gap="xs">
          <Button
            size="xs"
            variant={isEditing ? 'filled' : 'light'}
            color="teal"
            onClick={handleToggleEdit}
          >
            {isEditing ? 'Done' : 'Edit Touch Area'}
          </Button>
          {hasBounds && (
            <>
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
              <Tooltip label="Remove touch area">
                <ActionIcon
                  size="sm"
                  variant="subtle"
                  color="red"
                  onClick={handleRemove}
                >
                  <Trash2 size={14} />
                </ActionIcon>
              </Tooltip>
            </>
          )}
        </Group>
        {touchBounds &&
          (isEditing ? (
            <NumericInputGrid
              fields={(['x', 'y', 'width', 'height'] as const).map((key) => ({
                key,
                label:
                  key === 'width'
                    ? 'W'
                    : key === 'height'
                      ? 'H'
                      : key.toUpperCase(),
                value: touchBounds[key],
                ...(key === 'width' || key === 'height'
                  ? { min: MIN_SIZE }
                  : {}),
                onCommit: (value: number) =>
                  commitTouchBounds(nodeMeta.nodeId, fieldId, {
                    ...touchBounds,
                    [key]: value,
                  }),
              }))}
            />
          ) : (
            <BoundsDisplay
              items={[
                { label: 'X', value: touchBounds.x },
                { label: 'Y', value: touchBounds.y },
                { label: 'W', value: touchBounds.width },
                { label: 'H', value: touchBounds.height },
              ]}
            />
          ))}
      </Stack>
    </div>
  );
}
