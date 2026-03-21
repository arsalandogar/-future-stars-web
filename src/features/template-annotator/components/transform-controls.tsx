import {
  ActionIcon,
  Button,
  Checkbox,
  Group,
  NumberInput,
  SegmentedControl,
  Stack,
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
import {
  getElementBBoxInSvgRoot,
  computeSvgToParent,
} from '../utils/get-element-bbox';
import { getNodeFontSize } from '../utils/node-color-helpers';
import {
  applyScaleAroundPoint,
  applyMatrixPrepend,
  applyTranslate,
  conjugateTransform,
  parseScaleValues,
  transformPoint,
  transformVector,
} from '../utils/svg-transform-helpers';
import {
  MIN_SIZE,
  querySvgElement,
  getComputedTextAnchor,
} from '../utils/svg-overlay-helpers';
import {
  ensureTextDimensions,
  resetTextDimensions,
} from '../utils/text-area-helpers';
import { BoundsDisplay } from './bounds-display';
import { ColorAreaSelect } from './color-area-select';
import { useColorAreaOptions } from '../hooks/use-color-area-options';
import { NumericInputGrid } from './numeric-input-grid';

const ALIGN_OPTIONS = [
  { value: 'left', label: <AlignLeft size={14} /> },
  { value: 'center', label: <AlignCenter size={14} /> },
  { value: 'right', label: <AlignRight size={14} /> },
];
const ROTATE_STEP_DEGREES = 15;

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <Text size="xs" c="dimmed" tt="uppercase" fw={600} mb={4}>
      {children}
    </Text>
  );
}

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
  const commitNodeTransform = useAnnotatorStore((s) => s.commitNodeTransform);
  const node = nodeMap.get(nodeMeta.nodeId);
  const transformStr =
    node?.type === 'element' ? node.attributes.transform : undefined;
  const hasTransform = !!transformStr;
  const scaleValues = parseScaleValues(transformStr);
  const hasScale = !!scaleValues;
  const isEditing = editingNodeId === nodeMeta.nodeId;

  const bounds = useElementBounds(nodeMeta.nodeId, true);

  const setTextAlign = useAnnotatorStore((s) => s.setTextAlign);
  const setTextMultiline = useAnnotatorStore((s) => s.setTextMultiline);
  const setTextColorArea = useAnnotatorStore((s) => s.setTextColorArea);
  const setTextDimensions = useAnnotatorStore((s) => s.setTextDimensions);
  const setFontSize = useAnnotatorStore((s) => s.setFontSize);
  const assignment = useAnnotatorStore((s) =>
    fieldId
      ? s.assignments.find(
          (a) => a.nodeId === nodeMeta.nodeId && a.fieldId === fieldId
        )
      : undefined
  );
  const colorAreaOptions = useColorAreaOptions();
  const hasDimensions =
    assignment?.maxWidth != null && assignment?.maxHeight != null;

  const currentFontSize = fieldId && node ? getNodeFontSize(node) : undefined;

  const currentAlign: TextAlign = (() => {
    if (!fieldId) return 'left';
    if (assignment?.textAlign) return assignment.textAlign;
    const anchor = getComputedTextAnchor(nodeMeta.nodeId);
    if (anchor in TEXT_ANCHOR_TO_ALIGN) {
      return TEXT_ANCHOR_TO_ALIGN[anchor as SvgTextAnchor];
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
    const cx = bbox.x + bbox.width / 2;
    const cy = bbox.y + bbox.height / 2;
    const svgToParent = computeSvgToParent(svgEl, nodeMeta.nodeId);
    const parentCenter = transformPoint(svgToParent, cx, cy);
    rotateNode(nodeMeta.nodeId, ROTATE_STEP_DEGREES, parentCenter);
  };

  const handleTransformMove = (axis: 'x' | 'y', value: number) => {
    if (!bounds) return;
    const delta = value - bounds[axis];
    if (Math.abs(delta) < 0.01) return;

    const svgEl = querySvgElement();
    const svgToParent = svgEl
      ? computeSvgToParent(svgEl, nodeMeta.nodeId)
      : new DOMMatrix();
    const parentDelta = transformVector(
      svgToParent,
      axis === 'x' ? delta : 0,
      axis === 'y' ? delta : 0
    );
    commitNodeTransform(
      nodeMeta.nodeId,
      applyTranslate(transformStr, parentDelta.x, parentDelta.y)
    );
  };

  const handleTransformResize = (axis: 'width' | 'height', value: number) => {
    if (!bounds) return;

    const current = bounds[axis];
    if (current <= 0) return;

    const ratio = value / current;
    if (!Number.isFinite(ratio) || Math.abs(ratio - 1) < 0.001) return;

    const ax = axis === 'width' ? bounds.x : bounds.x + bounds.width / 2;
    const ay = axis === 'width' ? bounds.y + bounds.height / 2 : bounds.y;
    const sx = axis === 'width' ? ratio : 1;
    const sy = axis === 'width' ? 1 : ratio;

    const svgEl = querySvgElement();
    const svgToParent = svgEl
      ? computeSvgToParent(svgEl, nodeMeta.nodeId)
      : new DOMMatrix();

    if (!svgToParent.isIdentity) {
      const svgScaleOp = new DOMMatrix()
        .translateSelf(ax, ay)
        .scaleSelf(sx, sy)
        .translateSelf(-ax, -ay);
      const parentOp = conjugateTransform(svgToParent, svgScaleOp);
      commitNodeTransform(
        nodeMeta.nodeId,
        applyMatrixPrepend(transformStr, parentOp)
      );
    } else {
      commitNodeTransform(
        nodeMeta.nodeId,
        applyScaleAroundPoint(transformStr, ax, ay, sx, sy)
      );
    }
  };

  return (
    <Stack gap="lg">
      {/* Actions row */}
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

      {/* Position & Size section */}
      {bounds && (
        <div>
          <SectionLabel>Position &amp; Size</SectionLabel>
          <Stack gap="xs">
            {isEditing ? (
              <NumericInputGrid
                fields={[
                  {
                    key: 'x',
                    label: 'X',
                    value: bounds.x,
                    onCommit: (value) => handleTransformMove('x', value),
                  },
                  {
                    key: 'y',
                    label: 'Y',
                    value: bounds.y,
                    onCommit: (value) => handleTransformMove('y', value),
                  },
                  {
                    key: 'width',
                    label: 'W',
                    value: bounds.width,
                    min: MIN_SIZE,
                    onCommit: (value) => handleTransformResize('width', value),
                  },
                  {
                    key: 'height',
                    label: 'H',
                    value: bounds.height,
                    min: MIN_SIZE,
                    onCommit: (value) => handleTransformResize('height', value),
                  },
                ]}
              />
            ) : (
              <BoundsDisplay
                items={[
                  { label: 'X', value: bounds.x },
                  { label: 'Y', value: bounds.y },
                  { label: 'W', value: bounds.width },
                  { label: 'H', value: bounds.height },
                ]}
              />
            )}
            {scaleValues && (
              <BoundsDisplay
                items={[
                  { label: 'Scale X', value: scaleValues.sx },
                  { label: 'Scale Y', value: scaleValues.sy },
                ]}
              />
            )}
          </Stack>
        </div>
      )}

      {/* Text Area section */}
      {hasDimensions && assignment && (
        <div>
          <SectionLabel>Text Area</SectionLabel>
          {isEditing ? (
            <NumericInputGrid
              columns={2}
              fields={[
                {
                  key: 'maxWidth',
                  label: 'Max W',
                  value: assignment.maxWidth!,
                  min: MIN_SIZE,
                  onCommit: (value) =>
                    setTextDimensions(
                      nodeMeta.nodeId,
                      fieldId!,
                      value,
                      assignment.maxHeight!
                    ),
                },
                {
                  key: 'maxHeight',
                  label: 'Max H',
                  value: assignment.maxHeight!,
                  min: MIN_SIZE,
                  onCommit: (value) =>
                    setTextDimensions(
                      nodeMeta.nodeId,
                      fieldId!,
                      assignment.maxWidth!,
                      value
                    ),
                },
              ]}
            />
          ) : (
            <BoundsDisplay
              items={[
                { label: 'Max W', value: assignment.maxWidth! },
                { label: 'Max H', value: assignment.maxHeight! },
              ]}
            />
          )}
        </div>
      )}

      {/* Text Settings section */}
      {fieldId && (
        <div>
          <SectionLabel>Text</SectionLabel>
          <div className="flex items-center gap-2">
            <SegmentedControl
              size="xs"
              value={currentAlign}
              onChange={(value) => {
                ensureTextDimensions(nodeMeta.nodeId, fieldId);
                setTextAlign(nodeMeta.nodeId, fieldId, value as TextAlign);
              }}
              data={ALIGN_OPTIONS}
            />
            {currentFontSize != null && (
              <NumberInput
                size="xs"
                label="Size"
                value={currentFontSize}
                onChange={(value) => {
                  if (typeof value === 'number' && value > 0) {
                    setFontSize(nodeMeta.nodeId, value);
                  }
                }}
                min={1}
                step={1}
                className="flex-1"
              />
            )}
          </div>
          <Checkbox
            mt="xs"
            size="xs"
            label="Allow multiline wrap"
            checked={!!assignment?.multiline}
            onChange={(event) => {
              if (event.currentTarget.checked) {
                ensureTextDimensions(nodeMeta.nodeId, fieldId);
              }
              setTextMultiline(
                nodeMeta.nodeId,
                fieldId,
                event.currentTarget.checked
              );
            }}
          />
          <ColorAreaSelect
            mt="xs"
            label="Color area"
            description="Foreground color source for team colors"
            currentValue={assignment?.textColorArea}
            colorAreaOptions={colorAreaOptions}
            onChange={(value) =>
              setTextColorArea(nodeMeta.nodeId, fieldId, value)
            }
          />
        </div>
      )}
    </Stack>
  );
}
