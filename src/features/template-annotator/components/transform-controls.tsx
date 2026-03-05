import { ActionIcon, Button, Group, Text, Tooltip } from '@mantine/core';
import { RotateCcw } from 'lucide-react';

import type { NodeMeta } from '../types';
import { useAnnotatorStore } from '../stores/annotator-store';
import { useElementBounds } from '../hooks/use-element-bounds';
import { BoundsDisplay } from './bounds-display';

interface TransformControlsProps {
  nodeMeta: NodeMeta;
}

export function TransformControls({ nodeMeta }: TransformControlsProps) {
  const editingNodeId = useAnnotatorStore((s) => s.editingTransformNodeId);
  const setEditing = useAnnotatorStore((s) => s.setEditingTransform);
  const nodeMap = useAnnotatorStore((s) => s.nodeMap);
  const resetNodeTransform = useAnnotatorStore((s) => s.resetNodeTransform);
  const node = nodeMap.get(nodeMeta.nodeId);
  const hasTransform = node?.type === 'element' && !!node.attributes.transform;
  const isEditing = editingNodeId === nodeMeta.nodeId;

  const bounds = useElementBounds(nodeMeta.nodeId, isEditing);

  const handleToggleEdit = () => {
    setEditing(isEditing ? null : nodeMeta.nodeId);
  };

  const handleReset = () => {
    resetNodeTransform(nodeMeta.nodeId);
  };

  return (
    <div>
      <Text size="xs" c="dimmed" tt="uppercase" fw={600} mb={4}>
        Transform
      </Text>
      <Group gap="xs">
        <Button
          size="xs"
          variant={isEditing ? 'filled' : 'light'}
          color="orange"
          onClick={handleToggleEdit}
        >
          {isEditing ? 'Done' : 'Move / Resize'}
        </Button>
        {hasTransform && (
          <Tooltip label="Reset transform">
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
      {isEditing && bounds && <BoundsDisplay bounds={bounds} />}
    </div>
  );
}
