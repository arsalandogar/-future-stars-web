import {
  ActionIcon,
  Button,
  Group,
  SimpleGrid,
  Text,
  Tooltip,
} from '@mantine/core';
import { RotateCcw, Scaling } from 'lucide-react';

import type { NodeMeta } from '../types';
import { useAnnotatorStore } from '../stores/annotator-store';
import { useElementBounds } from '../hooks/use-element-bounds';
import { parseScaleValues } from '../utils/svg-transform-helpers';
import { BoundsDisplay } from './bounds-display';

interface TransformControlsProps {
  nodeMeta: NodeMeta;
}

export function TransformControls({ nodeMeta }: TransformControlsProps) {
  const editingNodeId = useAnnotatorStore((s) => s.editingTransformNodeId);
  const setEditing = useAnnotatorStore((s) => s.setEditingTransform);
  const nodeMap = useAnnotatorStore((s) => s.nodeMap);
  const resetNodeTransform = useAnnotatorStore((s) => s.resetNodeTransform);
  const removeNodeScale = useAnnotatorStore((s) => s.removeNodeScale);
  const node = nodeMap.get(nodeMeta.nodeId);
  const transformStr =
    node?.type === 'element' ? node.attributes.transform : undefined;
  const hasTransform = !!transformStr;
  const scaleValues = parseScaleValues(transformStr);
  const hasScale = !!scaleValues;
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
        {hasScale && (
          <Tooltip label="Remove scale">
            <ActionIcon
              size="sm"
              variant="subtle"
              color="orange"
              onClick={() => removeNodeScale(nodeMeta.nodeId)}
            >
              <Scaling size={14} />
            </ActionIcon>
          </Tooltip>
        )}
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
      {scaleValues && (
        <SimpleGrid cols={2} spacing={4} mt="xs">
          <Text size="xs" c="dimmed" ta="center">
            <Text span tt="uppercase" fw={600}>
              Scale X
            </Text>{' '}
            {scaleValues.sx.toFixed(2)}
          </Text>
          <Text size="xs" c="dimmed" ta="center">
            <Text span tt="uppercase" fw={600}>
              Scale Y
            </Text>{' '}
            {scaleValues.sy.toFixed(2)}
          </Text>
        </SimpleGrid>
      )}
    </div>
  );
}
