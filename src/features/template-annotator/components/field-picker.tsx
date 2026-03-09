import { useMemo, useState } from 'react';
import {
  Accordion,
  Badge,
  Stack,
  Text,
  ThemeIcon,
  Tooltip,
} from '@mantine/core';
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

// Text Slot fields are text fields that follow the pattern "Text 1", "Text 2", etc.
const TEXT_SLOT_FIELDS: EditableFieldId[] = ALL_FIELD_IDS.filter((id) => {
  const field = EDITABLE_FIELDS[id];
  return field.type === 'text' && /^Text \d+$/.test(field.label);
});

const DETAIL_FIELDS: EditableFieldId[] = ALL_FIELD_IDS.filter(
  (id) =>
    EDITABLE_FIELDS[id].type === 'text' &&
    !NAME_FIELDS.includes(id) &&
    !TEXT_SLOT_FIELDS.includes(id)
);

const FIELD_GROUPS: { label: string; fields: EditableFieldId[] }[] = [
  {
    label: 'Names',
    fields: ALL_FIELD_IDS.filter((id) => NAME_FIELDS.includes(id)),
  },
  {
    label: 'Details',
    fields: DETAIL_FIELDS,
  },
  {
    label: 'Text Slots',
    fields: TEXT_SLOT_FIELDS,
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
  const nodeIndex = useAnnotatorStore((s) => s.nodeIndex);

  const compatible = isFieldCompatible(fieldId, nodeMeta);
  const isAssignedHere = assignments.some(
    (a) => a.fieldId === fieldId && a.nodeId === nodeMeta.nodeId
  );
  const assignedElsewhereEntry = assignments.find(
    (a) => a.fieldId === fieldId && a.nodeId !== nodeMeta.nodeId
  );
  const isAssignedElsewhere = !!assignedElsewhereEntry;

  // Color fields can be multi-assigned to different nodes
  // Text/image: one node per field
  const isDisabled =
    !compatible || (field.type !== 'color' && isAssignedElsewhere);

  const colorCount = assignments.filter((a) => a.fieldId === fieldId).length;

  // Get label of the node this field is assigned to (for tooltip)
  const assignedToLabel = useMemo(() => {
    if (!assignedElsewhereEntry) return '';
    const meta = nodeIndex.get(assignedElsewhereEntry.nodeId);
    return meta?.label ?? assignedElsewhereEntry.nodeId;
  }, [assignedElsewhereEntry, nodeIndex]);

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
      const { svgTree, nodeMap } = useAnnotatorStore.getState();
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

  const item = (
    <div
      className={styles.fieldItem}
      data-assigned={isAssignedHere}
      data-disabled={isDisabled}
      data-assigned-elsewhere={isAssignedElsewhere && !isAssignedHere}
      onClick={isDisabled ? undefined : handleClick}
    >
      <div className="w-4 shrink-0">
        {isAssignedHere && (
          <ThemeIcon size={16} radius="xl" variant="filled" color="primary">
            <Check size={10} />
          </ThemeIcon>
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

  if (isDisabled && isAssignedElsewhere) {
    return (
      <Tooltip
        label={`Assigned to ${assignedToLabel}`}
        position="left"
        withArrow
      >
        {item}
      </Tooltip>
    );
  }

  return item;
}

interface FieldPickerProps {
  nodeMeta: NodeMeta;
}

export function FieldPicker({ nodeMeta }: FieldPickerProps) {
  const assignments = useAnnotatorStore((s) => s.assignments);

  // Only show groups that have at least one compatible field
  const compatibleGroups = useMemo(
    () =>
      FIELD_GROUPS.filter((group) =>
        group.fields.some((fieldId) => isFieldCompatible(fieldId, nodeMeta))
      ),
    [nodeMeta]
  );

  // Count assignments per group for selected node
  const groupAssignmentCounts = useMemo(() => {
    const counts = new Map<string, { assigned: number; total: number }>();
    for (const group of compatibleGroups) {
      const compatibleFields = group.fields.filter((fid) =>
        isFieldCompatible(fid, nodeMeta)
      );
      const assignedCount = compatibleFields.filter((fid) =>
        assignments.some(
          (a) => a.fieldId === fid && a.nodeId === nodeMeta.nodeId
        )
      ).length;
      counts.set(group.label, {
        assigned: assignedCount,
        total: compatibleFields.length,
      });
    }
    return counts;
  }, [compatibleGroups, assignments, nodeMeta]);

  // Auto-expand groups that have assignments on the selected node
  const defaultExpanded = useMemo(() => {
    const expanded: string[] = [];
    for (const group of compatibleGroups) {
      const count = groupAssignmentCounts.get(group.label);
      if (count && count.assigned > 0) {
        expanded.push(group.label);
      }
    }
    // If nothing is expanded, expand the first group
    if (expanded.length === 0 && compatibleGroups.length > 0) {
      expanded.push(compatibleGroups[0].label);
    }
    return expanded;
  }, [compatibleGroups, groupAssignmentCounts]);

  return (
    <Accordion
      multiple
      defaultValue={defaultExpanded}
      variant="default"
      classNames={{
        root: styles.accordionRoot,
        item: styles.accordionItem,
        control: styles.accordionControl,
        label: styles.accordionLabel,
        content: styles.accordionContent,
        chevron: styles.accordionChevron,
      }}
    >
      {compatibleGroups.map((group) => {
        const count = groupAssignmentCounts.get(group.label);
        return (
          <Accordion.Item key={group.label} value={group.label}>
            <Accordion.Control>
              <div className="flex items-center gap-2">
                <span>{group.label}</span>
                {count && count.assigned > 0 && (
                  <Badge size="xs" variant="light" color="primary">
                    {count.assigned}/{count.total}
                  </Badge>
                )}
              </div>
            </Accordion.Control>
            <Accordion.Panel>
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
            </Accordion.Panel>
          </Accordion.Item>
        );
      })}
    </Accordion>
  );
}
