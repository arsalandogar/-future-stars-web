import { useMemo } from 'react';
import {
  ActionIcon,
  Button,
  ColorInput,
  Divider,
  Group,
  NumberInput,
  ScrollArea,
  SegmentedControl,
  Stack,
  Text,
  Tooltip,
} from '@mantine/core';
import { RotateCcw, Trash2, X } from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';

import { EDITABLE_FIELDS, type EditableFieldId } from '@/features/templates';

import type { TextAlign } from '../types';
import { useAnnotatorStore } from '../stores/annotator-store';
import { getTextFillColor, getNodeFontSize } from '../utils/node-color-helpers';
import { getElementBBoxInSvgRoot } from '../utils/get-element-bbox';
import { querySvgElement } from '../utils/svg-overlay-helpers';
import { ALIGN_OPTIONS, getCurrentAlign } from '../utils/text-align-helpers';
import { ensureTextDimensions } from '../utils/text-area-helpers';
import { ensureTouchBounds } from '../utils/touch-bounds-helpers';
import { BoundsDisplay } from './bounds-display';
import { ColorAreaSelect } from './color-area-select';
import { ColorAreaPreviewList } from './color-area-preview-list';
import { useColorAreaOptions } from '../hooks/use-color-area-options';

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface BulkTextSettingsPanelProps {
  onClose: () => void;
}

export function BulkTextSettingsPanel({ onClose }: BulkTextSettingsPanelProps) {
  const {
    assignments,
    nodeMap,
    nodeIndex,
    editingTouchBoundsNodeId,
    editingTransformNodeId,
    bulkTouchBoundsEditing,
    bulkTransformEditing,
  } = useAnnotatorStore(
    useShallow((s) => ({
      assignments: s.assignments,
      nodeMap: s.nodeMap,
      nodeIndex: s.nodeIndex,
      editingTouchBoundsNodeId: s.editingTouchBoundsNodeId,
      editingTransformNodeId: s.editingTransformNodeId,
      bulkTouchBoundsEditing: s.bulkTouchBoundsEditing,
      bulkTransformEditing: s.bulkTransformEditing,
    }))
  );

  const store = useAnnotatorStore;

  // ---- Derived data ----

  const textAssignments = useMemo(
    () => assignments.filter((a) => EDITABLE_FIELDS[a.fieldId].type === 'text'),
    [assignments]
  );

  const colorAreaOptions = useColorAreaOptions();

  // ---- Immediate action helpers ----

  const handleSetAlign = (
    nodeId: string,
    fieldId: EditableFieldId,
    align: TextAlign
  ) => {
    ensureTextDimensions(nodeId, fieldId);
    store.getState().setTextAlign(nodeId, fieldId, align);
  };

  const handleToggleTransformEdit = (
    nodeId: string,
    fieldId: EditableFieldId
  ) => {
    const s = store.getState();
    if (s.editingTransformNodeId === nodeId) {
      s.setEditingTransform(null);
    } else {
      ensureTextDimensions(nodeId, fieldId);
      s.selectNode(nodeId);
      s.setEditingTransform(nodeId);
    }
  };

  const handleToggleTouchEdit = (nodeId: string, fieldId: EditableFieldId) => {
    const s = store.getState();
    if (s.editingTouchBoundsNodeId === nodeId) {
      s.setEditingTouchBounds(null);
    } else {
      ensureTouchBounds(nodeId, fieldId);
      s.selectNode(nodeId);
      s.setEditingTouchBounds(nodeId);
    }
  };

  const handleResetTouchBounds = (nodeId: string, fieldId: EditableFieldId) => {
    const svgElement = querySvgElement();
    if (!svgElement) return;
    const bbox = getElementBBoxInSvgRoot(svgElement, nodeId);
    if (bbox) store.getState().commitTouchBounds(nodeId, fieldId, bbox);
  };

  const handleRemoveTouchBounds = (
    nodeId: string,
    fieldId: EditableFieldId
  ) => {
    const s = store.getState();
    s.removeTouchBounds(nodeId, fieldId);
    if (s.editingTouchBoundsNodeId === nodeId) s.setEditingTouchBounds(null);
  };

  // ---- "Apply to all" handlers ----

  const handleToggleAllTransform = () => {
    const s = store.getState();
    if (s.bulkTransformEditing) {
      s.setBulkTransformEditing(false);
    } else {
      for (const a of textAssignments) {
        ensureTextDimensions(a.nodeId, a.fieldId);
      }
      s.setBulkTransformEditing(true);
    }
  };

  const handleToggleAllTouchEdit = () => {
    const s = store.getState();
    if (s.bulkTouchBoundsEditing) {
      s.setBulkTouchBoundsEditing(false);
    } else {
      for (const a of textAssignments) {
        ensureTouchBounds(a.nodeId, a.fieldId);
      }
      s.setBulkTouchBoundsEditing(true);
    }
  };

  // ---- Render ----

  if (textAssignments.length === 0) {
    return (
      <Stack gap="md" p="md">
        <Group justify="space-between">
          <Text fw={600} size="sm">
            Text Settings
          </Text>
          <ActionIcon variant="subtle" size="sm" onClick={onClose}>
            <X size={16} />
          </ActionIcon>
        </Group>
        <Text size="sm" c="dimmed">
          No text fields assigned yet. Assign text fields first.
        </Text>
      </Stack>
    );
  }

  return (
    <ScrollArea h="100%">
      <Stack gap="sm" p="md">
        {/* ---- Header ---- */}
        <Group justify="space-between">
          <Text fw={600} size="sm">
            Text Settings
          </Text>
          <ActionIcon variant="subtle" size="sm" onClick={onClose}>
            <X size={16} />
          </ActionIcon>
        </Group>

        {/* ---- Apply to All ---- */}
        <div className="rounded-md bg-(--mantine-color-dark-6) p-2.5">
          <Text size="xs" fw={600} c="dimmed" tt="uppercase" mb="xs">
            Apply to All
          </Text>
          <Stack gap="xs">
            <Button
              size="xs"
              variant={bulkTransformEditing ? 'filled' : 'light'}
              color="orange"
              onClick={handleToggleAllTransform}
              fullWidth
            >
              {bulkTransformEditing ? 'Done Resize' : 'Move / Resize All'}
            </Button>
            <Button
              size="xs"
              variant={bulkTouchBoundsEditing ? 'filled' : 'light'}
              color="teal"
              onClick={handleToggleAllTouchEdit}
              fullWidth
            >
              {bulkTouchBoundsEditing
                ? 'Done Touch Areas'
                : 'Edit All Touch Areas'}
            </Button>
          </Stack>
        </div>

        {/* ---- Color Area Preview ---- */}
        {colorAreaOptions.length > 0 && (
          <ColorAreaPreviewList colorAreaOptions={colorAreaOptions} />
        )}

        <Divider />

        {/* ---- Per-field sections ---- */}
        {textAssignments.map((a) => {
          const node = nodeMap.get(a.nodeId);
          const meta = nodeIndex.get(a.nodeId);
          const fontSize = node ? getNodeFontSize(node) : undefined;
          const fillColor = node ? getTextFillColor(node) : '#000000';
          const align = getCurrentAlign(a, a.nodeId);
          const isEditingTransform = editingTransformNodeId === a.nodeId;
          const isEditingTouch = editingTouchBoundsNodeId === a.nodeId;
          const hasTouchBounds = !!a.touchBounds;

          return (
            <div key={`${a.nodeId}::${a.fieldId}`}>
              {/* Field label */}
              <Text size="xs" fw={600} truncate>
                {EDITABLE_FIELDS[a.fieldId].label}
              </Text>
              {meta && (
                <Text size="xs" c="dimmed" truncate mb={4}>
                  {meta.label}
                </Text>
              )}

              <Stack gap="xs">
                {/* Move / Resize */}
                <Button
                  size="xs"
                  variant={isEditingTransform ? 'filled' : 'light'}
                  color="orange"
                  onClick={() => handleToggleTransformEdit(a.nodeId, a.fieldId)}
                  fullWidth
                >
                  {isEditingTransform ? 'Done' : 'Move / Resize'}
                </Button>

                {/* Alignment + Size */}
                <Group gap="xs" wrap="nowrap">
                  <SegmentedControl
                    size="xs"
                    value={align}
                    onChange={(v) =>
                      handleSetAlign(a.nodeId, a.fieldId, v as TextAlign)
                    }
                    data={ALIGN_OPTIONS}
                  />
                  {fontSize != null && (
                    <NumberInput
                      size="xs"
                      value={fontSize}
                      onChange={(v) => {
                        if (typeof v === 'number' && v > 0) {
                          store.getState().setFontSize(a.nodeId, v);
                        }
                      }}
                      min={1}
                      step={1}
                      style={{ flex: 1 }}
                      label="Size"
                    />
                  )}
                </Group>

                {/* Color area */}
                {colorAreaOptions.length > 0 && (
                  <ColorAreaSelect
                    currentValue={a.textColorArea}
                    colorAreaOptions={colorAreaOptions}
                    onChange={(value) =>
                      store
                        .getState()
                        .setTextColorArea(a.nodeId, a.fieldId, value)
                    }
                  />
                )}

                {/* Fill color */}
                <ColorInput
                  size="xs"
                  label="Text color"
                  value={fillColor}
                  onChange={(v) =>
                    store.getState().setTextFillColor(a.nodeId, v)
                  }
                  withEyeDropper={false}
                  format="hex"
                />

                {/* Touch area */}
                <div>
                  <Text size="xs" c="dimmed" tt="uppercase" fw={600} mb={4}>
                    Touch Area
                  </Text>
                  <Group gap="xs">
                    <Button
                      size="xs"
                      variant={isEditingTouch ? 'filled' : 'light'}
                      color="teal"
                      onClick={() => handleToggleTouchEdit(a.nodeId, a.fieldId)}
                    >
                      {isEditingTouch ? 'Done' : 'Edit'}
                    </Button>
                    {hasTouchBounds && (
                      <>
                        <Tooltip label="Reset to element bounds">
                          <ActionIcon
                            size="sm"
                            variant="subtle"
                            color="gray"
                            onClick={() =>
                              handleResetTouchBounds(a.nodeId, a.fieldId)
                            }
                          >
                            <RotateCcw size={14} />
                          </ActionIcon>
                        </Tooltip>
                        <Tooltip label="Remove touch area">
                          <ActionIcon
                            size="sm"
                            variant="subtle"
                            color="red"
                            onClick={() =>
                              handleRemoveTouchBounds(a.nodeId, a.fieldId)
                            }
                          >
                            <Trash2 size={14} />
                          </ActionIcon>
                        </Tooltip>
                      </>
                    )}
                  </Group>
                  {a.touchBounds && (
                    <div className="mt-1">
                      <BoundsDisplay
                        items={[
                          { label: 'X', value: a.touchBounds.x },
                          { label: 'Y', value: a.touchBounds.y },
                          { label: 'W', value: a.touchBounds.width },
                          { label: 'H', value: a.touchBounds.height },
                        ]}
                      />
                    </div>
                  )}
                </div>
              </Stack>

              <Divider mt="sm" />
            </div>
          );
        })}
      </Stack>
    </ScrollArea>
  );
}
