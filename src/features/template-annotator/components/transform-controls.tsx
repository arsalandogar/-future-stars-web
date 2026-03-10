import {
  ActionIcon,
  Button,
  Group,
  NumberInput,
  SegmentedControl,
  SimpleGrid,
  Text,
  Tooltip,
} from '@mantine/core';
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  RotateCw,
  Scaling,
  Undo2,
} from 'lucide-react';

import type { EditableFieldId } from '@/features/templates';

import type { NodeMeta, TextAlign, SvgTextAnchor } from '../types';
import { TEXT_ANCHOR_TO_ALIGN } from '../types';
import { useAnnotatorStore } from '../stores/annotator-store';
import { useElementBounds } from '../hooks/use-element-bounds';
import { getElementBBoxInSvgRoot } from '../utils/get-element-bbox';
import { parseScaleValues } from '../utils/svg-transform-helpers';
import { querySvgElement } from '../utils/svg-overlay-helpers';
import {
  ensureTextDimensions,
  resetTextDimensions,
} from '../utils/text-area-helpers';
import { BoundsDisplay } from './bounds-display';

const ALIGN_OPTIONS = [
  { value: 'left', label: <AlignLeft size={14} /> },
  { value: 'center', label: <AlignCenter size={14} /> },
  { value: 'right', label: <AlignRight size={14} /> },
];
const ROTATE_STEP_DEGREES = 15;

interface TransformControlsProps {
  nodeMeta: NodeMeta;
  fieldId?: EditableFieldId;
}

export function TransformControls({
  nodeMeta,
  fieldId,
}: TransformControlsProps) {
  const editingNodeId = useAnnotatorStore((s) => s.editingTransformNodeId);
  const setEditing = useAnnotatorStore((s) => s.setEditingTransform);
  const nodeMap = useAnnotatorStore((s) => s.nodeMap);
  const rotateNode = useAnnotatorStore((s) => s.rotateNode);
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

  const setTextAlign = useAnnotatorStore((s) => s.setTextAlign);
  const setFontSize = useAnnotatorStore((s) => s.setFontSize);
  const assignment = useAnnotatorStore((s) =>
    fieldId
      ? s.assignments.find(
          (a) => a.nodeId === nodeMeta.nodeId && a.fieldId === fieldId
        )
      : undefined
  );
  const hasDimensions =
    assignment?.maxWidth != null && assignment?.maxHeight != null;

  const currentFontSize = (() => {
    if (!fieldId || node?.type !== 'element') return undefined;
    const fromAttr = node.attributes['font-size'];
    if (fromAttr) return Number(fromAttr);
    const styleMatch = node.attributes.style?.match(/font-size:\s*([\d.]+)/);
    if (styleMatch) return Number(styleMatch[1]);
    return undefined;
  })();

  const currentAlign: TextAlign = (() => {
    if (!fieldId) return 'left';
    if (assignment?.textAlign) return assignment.textAlign;
    if (node?.type === 'element') {
      // Check inline style first (CSS precedence), then SVG attribute
      const styleMatch = node.attributes.style?.match(
        /text-anchor\s*:\s*(\w+)/
      );
      const anchor = styleMatch?.[1] ?? node.attributes['text-anchor'];
      if (anchor && anchor in TEXT_ANCHOR_TO_ALIGN) {
        return TEXT_ANCHOR_TO_ALIGN[anchor as SvgTextAnchor];
      }
    }
    return 'left';
  })();

  const handleToggleEdit = () => {
    if (isEditing) {
      setEditing(null);
    } else {
      if (fieldId) {
        ensureTextDimensions(nodeMeta.nodeId, fieldId);
      }
      setEditing(nodeMeta.nodeId);
    }
  };

  const handleReset = () => {
    resetNodeTransform(nodeMeta.nodeId);
    if (fieldId && hasDimensions) {
      resetTextDimensions(nodeMeta.nodeId, fieldId);
    }
  };

  const handleRotate = () => {
    const svgEl = querySvgElement();
    if (!svgEl) return;
    const bbox = getElementBBoxInSvgRoot(svgEl, nodeMeta.nodeId);
    if (!bbox) return;
    rotateNode(nodeMeta.nodeId, ROTATE_STEP_DEGREES, {
      x: bbox.x + bbox.width / 2,
      y: bbox.y + bbox.height / 2,
    });
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
        <Button
          size="xs"
          variant="light"
          color="blue"
          leftSection={<RotateCw size={14} />}
          onClick={handleRotate}
          aria-label={`Rotate ${ROTATE_STEP_DEGREES} degrees clockwise`}
        >
          Rotate {ROTATE_STEP_DEGREES}&deg;
        </Button>
        {hasScale && (
          <Tooltip label="Remove scale">
            <ActionIcon
              size="sm"
              variant="subtle"
              color="orange"
              onClick={() => removeNodeScale(nodeMeta.nodeId)}
              aria-label="Remove scale"
            >
              <Scaling size={14} />
            </ActionIcon>
          </Tooltip>
        )}
        {(hasTransform || hasDimensions) && (
          <Tooltip label="Reset transform and dimensions">
            <ActionIcon
              size="sm"
              variant="subtle"
              color="gray"
              onClick={handleReset}
              aria-label="Reset transform and dimensions"
            >
              <Undo2 size={14} />
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
      {isEditing && hasDimensions && (
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
      {fieldId && (
        <SegmentedControl
          size="xs"
          value={currentAlign}
          onChange={(value) => {
            ensureTextDimensions(nodeMeta.nodeId, fieldId);
            setTextAlign(nodeMeta.nodeId, fieldId, value as TextAlign);
          }}
          data={ALIGN_OPTIONS}
          mt="xs"
        />
      )}
      {fieldId && currentFontSize != null && (
        <NumberInput
          size="xs"
          label="Font Size"
          value={currentFontSize}
          onChange={(value) => {
            if (typeof value === 'number' && value > 0) {
              setFontSize(nodeMeta.nodeId, value);
            }
          }}
          min={1}
          step={1}
          mt="xs"
        />
      )}
    </div>
  );
}
