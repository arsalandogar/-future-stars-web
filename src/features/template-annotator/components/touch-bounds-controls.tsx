import { ActionIcon, Button, Group, Text, Tooltip } from '@mantine/core';
import { RotateCcw, Trash2 } from 'lucide-react';

import type { EditableFieldId } from '@/features/templates';

import type { NodeMeta } from '../types';
import { useAnnotatorStore } from '../stores/annotator-store';
import { getElementBBoxInSvgRoot } from '../utils/get-element-bbox';
import { querySvgElement } from '../utils/svg-overlay-helpers';

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

  const handleToggleEdit = () => {
    if (isEditing) {
      setEditing(null);
    } else {
      // If no bounds yet, initialize from element bbox
      if (!hasBounds) {
        const svgElement = querySvgElement();
        if (svgElement) {
          const bbox = getElementBBoxInSvgRoot(svgElement, nodeMeta.nodeId);
          if (bbox) {
            commitTouchBounds(nodeMeta.nodeId, fieldId, bbox);
          }
        }
      }
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
      <Group gap="xs">
        <Button
          size="xs"
          variant={isEditing ? 'filled' : 'light'}
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
    </div>
  );
}
