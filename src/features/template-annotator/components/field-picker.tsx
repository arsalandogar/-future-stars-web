import { useState } from 'react';
import { Badge, Stack, Text } from '@mantine/core';
import { Check } from 'lucide-react';

import { EDITABLE_FIELDS, type EditableFieldId } from '@/features/templates';

import type { ColorTarget, FieldAssignment, NodeMeta } from '../types';
import { useAnnotatorStore } from '../stores/annotator-store';
import { isFieldCompatible } from '../utils/svg-node-helpers';
import { measureTextBounds } from '../utils/measure-text-bounds';

import { StrokeTargetToggle } from './stroke-target-toggle';

import styles from './field-picker.module.css';

const ALL_FIELD_IDS = Object.keys(EDITABLE_FIELDS) as EditableFieldId[];
const NAME_FIELDS: EditableFieldId[] = ['firstName', 'lastName', 'fullName'];

const FIELD_GROUPS: { label: string; fields: EditableFieldId[] }[] = [
  {
    label: 'Names',
    fields: ALL_FIELD_IDS.filter((id) => NAME_FIELDS.includes(id)),
  },
  {
    label: 'Details',
    fields: ALL_FIELD_IDS.filter(
      (id) => EDITABLE_FIELDS[id].type === 'text' && !NAME_FIELDS.includes(id)
    ),
  },
  {
    label: 'Images',
    fields: ALL_FIELD_IDS.filter((id) => EDITABLE_FIELDS[id].type === 'image'),
  },
  {
    label: 'Colors',
    fields: ALL_FIELD_IDS.filter((id) => EDITABLE_FIELDS[id].type === 'color'),
  },
];

interface FieldItemProps {
  fieldId: EditableFieldId;
  nodeMeta: NodeMeta;
  assignments: FieldAssignment[];
}

function FieldItem({ fieldId, nodeMeta, assignments }: FieldItemProps) {
  const [colorTarget, setColorTarget] = useState<ColorTarget>(
    nodeMeta.hasStopColor ? 'stop-color' : 'fill'
  );
  const field = EDITABLE_FIELDS[fieldId];
  const assignField = useAnnotatorStore((s) => s.assignField);
  const removeAssignment = useAnnotatorStore((s) => s.removeAssignment);
  const setTextDimensions = useAnnotatorStore((s) => s.setTextDimensions);
  const svgTree = useAnnotatorStore((s) => s.svgTree);
  const nodeMap = useAnnotatorStore((s) => s.nodeMap);

  const compatible = isFieldCompatible(fieldId, nodeMeta);
  const isAssignedHere = assignments.some(
    (a) => a.fieldId === fieldId && a.nodeId === nodeMeta.nodeId
  );
  const isAssignedElsewhere = assignments.some(
    (a) => a.fieldId === fieldId && a.nodeId !== nodeMeta.nodeId
  );

  // Color fields can be multi-assigned to different nodes
  // Text/image: one node per field
  const isDisabled =
    !compatible || (field.type !== 'color' && isAssignedElsewhere);

  const colorCount = assignments.filter((a) => a.fieldId === fieldId).length;

  const handleClick = () => {
    if (isDisabled) return;

    if (isAssignedHere) {
      removeAssignment(nodeMeta.nodeId, fieldId);
    } else {
      const target =
        field.type === 'color'
          ? nodeMeta.hasStopColor
            ? 'stop-color'
            : colorTarget
          : undefined;
      assignField(nodeMeta.nodeId, fieldId, target);

      // Auto-measure text dimensions
      if (field.type === 'text' && svgTree) {
        const textNode = nodeMap.get(nodeMeta.nodeId);
        if (textNode) {
          const bounds = measureTextBounds(textNode, svgTree);
          if (bounds) {
            setTextDimensions(
              nodeMeta.nodeId,
              fieldId,
              bounds.width,
              bounds.height
            );
          }
        }
      }
    }
  };

  return (
    <div
      className={styles.fieldItem}
      data-assigned={isAssignedHere}
      data-disabled={isDisabled}
      onClick={isDisabled ? undefined : handleClick}
    >
      <div className="w-4 shrink-0">
        {isAssignedHere && (
          <Check size={14} color="var(--mantine-color-primary-4)" />
        )}
      </div>

      <Text size="sm" className="flex-1">
        {field.label}
      </Text>

      {field.type === 'color' && colorCount > 0 && (
        <Badge size="xs" variant="light" circle>
          {colorCount}
        </Badge>
      )}

      {field.type === 'color' &&
        compatible &&
        !isAssignedHere &&
        !nodeMeta.hasStopColor && (
          <StrokeTargetToggle
            value={colorTarget}
            onChange={setColorTarget}
            hasFill={nodeMeta.hasFill}
            hasStroke={nodeMeta.hasStroke}
          />
        )}
    </div>
  );
}

interface FieldPickerProps {
  nodeMeta: NodeMeta;
}

export function FieldPicker({ nodeMeta }: FieldPickerProps) {
  const assignments = useAnnotatorStore((s) => s.assignments);

  // Only show groups that have at least one compatible field
  const compatibleGroups = FIELD_GROUPS.filter((group) =>
    group.fields.some((fieldId) => isFieldCompatible(fieldId, nodeMeta))
  );

  return (
    <Stack gap="md">
      {compatibleGroups.map((group) => (
        <div key={group.label}>
          <Text
            size="xs"
            fw={600}
            c="dimmed"
            tt="uppercase"
            mb={4}
            className={styles.groupLabel}
          >
            {group.label}
          </Text>
          <Stack gap={2}>
            {group.fields.map((fieldId) => (
              <FieldItem
                key={fieldId}
                fieldId={fieldId}
                nodeMeta={nodeMeta}
                assignments={assignments}
              />
            ))}
          </Stack>
        </div>
      ))}
    </Stack>
  );
}
