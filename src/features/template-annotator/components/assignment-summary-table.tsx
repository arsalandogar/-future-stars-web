import { useMemo, useState } from 'react';
import { ActionIcon, Badge, Group, Stack, Text, Tooltip } from '@mantine/core';
import { ChevronRight, Image, Palette, Trash2, Type } from 'lucide-react';

import { EDITABLE_FIELDS, type EditableFieldId } from '@/features/templates';

import type { FieldAssignment, NodeMeta } from '../types';
import { useAnnotatorStore } from '../stores/annotator-store';

import styles from './assignment-summary-table.module.css';

const TYPE_CONFIG = {
  color: { label: 'Colors', icon: Palette, color: 'violet' },
  text: { label: 'Texts', icon: Type, color: 'blue' },
  image: { label: 'Images', icon: Image, color: 'green' },
} as const;

function SummaryHeader({ assignments }: { assignments: FieldAssignment[] }) {
  const counts = useMemo(() => {
    const c = { color: 0, text: 0, image: 0 };
    const seen = new Set<string>();
    for (const a of assignments) {
      const key = `${a.nodeId}-${a.fieldId}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const type = EDITABLE_FIELDS[a.fieldId].type;
      if (type in c) c[type]++;
    }
    return c;
  }, [assignments]);

  const total = counts.color + counts.text + counts.image;

  return (
    <div className={styles.summaryHeader}>
      <Group gap="md">
        {(
          Object.entries(TYPE_CONFIG) as [
            keyof typeof counts,
            (typeof TYPE_CONFIG)[keyof typeof TYPE_CONFIG],
          ][]
        ).map(
          ([type, config]) =>
            counts[type] > 0 && (
              <Group key={type} gap={6}>
                <div
                  className={styles.dot}
                  style={{
                    backgroundColor: `var(--mantine-color-${config.color}-5)`,
                  }}
                />
                <Text size="xs" fw={500}>
                  {counts[type]} {config.label}
                </Text>
              </Group>
            )
        )}
      </Group>
      <Text size="xs" c="dimmed">
        {total} field{total !== 1 ? 's' : ''} assigned
      </Text>
    </div>
  );
}

function CollapsibleColorRow({
  fieldId,
  colorAssignments,
}: {
  fieldId: EditableFieldId;
  colorAssignments: FieldAssignment[];
}) {
  const [expanded, setExpanded] = useState(false);
  const field = EDITABLE_FIELDS[fieldId];
  const nodeIndex = useAnnotatorStore((s) => s.nodeIndex);
  const selectNode = useAnnotatorStore((s) => s.selectNode);
  const removeAssignment = useAnnotatorStore((s) => s.removeAssignment);

  if (colorAssignments.length === 1) {
    return <AssignmentCard assignment={colorAssignments[0]} type="color" />;
  }

  return (
    <div className={styles.collapsibleGroup}>
      <div
        className={styles.collapsibleHeader}
        onClick={() => setExpanded(!expanded)}
      >
        <ChevronRight
          size={14}
          className={styles.collapsibleChevron}
          data-expanded={expanded}
        />
        <Text size="sm" fw={600} className="flex-1">
          {field.label}
        </Text>
        <Badge size="xs" variant="light" color="violet">
          {colorAssignments.length} elements
        </Badge>
      </div>
      {expanded && (
        <Stack gap={4} className={styles.collapsibleContent}>
          {colorAssignments.map((a) => {
            const meta = nodeIndex.get(a.nodeId);
            return (
              <div
                key={`${a.nodeId}-${a.fieldId}`}
                className={styles.subCard}
                data-type="color"
                onClick={() => selectNode(a.nodeId)}
              >
                <div className={styles.cardElement}>
                  <ElementRef meta={meta} nodeId={a.nodeId} />
                </div>
                {a.colorTarget && (
                  <Badge size="xs" variant="outline" className="flex-shrink-0">
                    {a.colorTarget}
                  </Badge>
                )}
                <Tooltip label="Remove">
                  <ActionIcon
                    variant="subtle"
                    color="red"
                    size="sm"
                    className={styles.deleteButton}
                    onClick={(e) => {
                      e.stopPropagation();
                      removeAssignment(a.nodeId, a.fieldId);
                    }}
                  >
                    <Trash2 size={14} />
                  </ActionIcon>
                </Tooltip>
              </div>
            );
          })}
        </Stack>
      )}
    </div>
  );
}

function ElementRef({
  meta,
  nodeId,
}: {
  meta: NodeMeta | undefined;
  nodeId: string;
}) {
  if (!meta) return <span>{nodeId}</span>;

  const labelMatch = meta.label.match(/^(<[^>]+>)(.*)/);
  if (labelMatch) {
    return (
      <>
        <span className={styles.refTagName}>{labelMatch[1]}</span>
        {labelMatch[2] && <span>{labelMatch[2]}</span>}
      </>
    );
  }
  return <span>{meta.label}</span>;
}

function AssignmentCard({
  assignment: a,
  type,
}: {
  assignment: FieldAssignment;
  type: 'color' | 'text' | 'image';
}) {
  const field = EDITABLE_FIELDS[a.fieldId];
  const nodeIndex = useAnnotatorStore((s) => s.nodeIndex);
  const selectNode = useAnnotatorStore((s) => s.selectNode);
  const removeAssignment = useAnnotatorStore((s) => s.removeAssignment);
  const meta = nodeIndex.get(a.nodeId);

  return (
    <div
      className={styles.card}
      data-type={type}
      onClick={() => selectNode(a.nodeId)}
    >
      <div className={styles.cardHeader}>
        <Text size="sm" fw={600} truncate>
          {field.label}
        </Text>
        <Group gap={4} wrap="nowrap" className="flex-shrink-0">
          {a.colorTarget && (
            <Badge size="xs" variant="outline">
              {a.colorTarget}
            </Badge>
          )}
        </Group>
      </div>

      <div className={styles.cardElement}>
        <ElementRef meta={meta} nodeId={a.nodeId} />
      </div>

      {field.type === 'text' && (a.maxWidth != null || a.maxHeight != null) && (
        <Text size="xs" c="dimmed" mt={2}>
          {a.maxWidth ?? '–'} × {a.maxHeight ?? '–'}
          {a.textAlign && a.textAlign !== 'left' && ` · ${a.textAlign}`}
        </Text>
      )}

      <Tooltip label="Remove">
        <ActionIcon
          variant="subtle"
          color="red"
          size="sm"
          className={styles.deleteButton}
          onClick={(e) => {
            e.stopPropagation();
            removeAssignment(a.nodeId, a.fieldId);
          }}
        >
          <Trash2 size={14} />
        </ActionIcon>
      </Tooltip>
    </div>
  );
}

export function AssignmentSummaryTable() {
  const assignments = useAnnotatorStore((s) => s.assignments);

  const sections = useMemo(() => {
    const grouped: Record<string, FieldAssignment[]> = {
      color: [],
      text: [],
      image: [],
    };
    for (const a of assignments) {
      const type = EDITABLE_FIELDS[a.fieldId].type;
      if (type in grouped) grouped[type].push(a);
    }
    return Object.entries(TYPE_CONFIG)
      .filter(([type]) => grouped[type].length > 0)
      .map(([type, config]) => ({
        type: type as 'color' | 'text' | 'image',
        ...config,
        assignments: grouped[type],
      }));
  }, [assignments]);

  // Group color assignments by fieldId for collapsible rows
  const colorFieldGroups = useMemo(() => {
    const colorSection = sections.find((s) => s.type === 'color');
    if (!colorSection) return new Map<EditableFieldId, FieldAssignment[]>();
    const groups = new Map<EditableFieldId, FieldAssignment[]>();
    for (const a of colorSection.assignments) {
      const existing = groups.get(a.fieldId) || [];
      existing.push(a);
      groups.set(a.fieldId, existing);
    }
    return groups;
  }, [sections]);

  if (assignments.length === 0) {
    return (
      <Text size="sm" c="dimmed" ta="center" py="xl">
        No fields assigned yet.
      </Text>
    );
  }

  return (
    <Stack gap="md">
      <SummaryHeader assignments={assignments} />

      {sections.map((section) => (
        <div key={section.type}>
          <Group gap={6} mb={8} className={styles.sectionHeader}>
            <section.icon
              size={14}
              color={`var(--mantine-color-${section.color}-5)`}
            />
            <Text size="xs" fw={600} tt="uppercase" c="dimmed">
              {section.label}
            </Text>
            <Badge size="xs" variant="light" color={section.color}>
              {section.type === 'color'
                ? colorFieldGroups.size
                : section.assignments.length}
            </Badge>
          </Group>

          <Stack gap={6}>
            {section.type === 'color'
              ? Array.from(colorFieldGroups.entries()).map(
                  ([fieldId, colorAssignments]) => (
                    <CollapsibleColorRow
                      key={fieldId}
                      fieldId={fieldId}
                      colorAssignments={colorAssignments}
                    />
                  )
                )
              : section.assignments.map((a) => (
                  <AssignmentCard
                    key={`${a.nodeId}-${a.fieldId}`}
                    assignment={a}
                    type={section.type}
                  />
                ))}
          </Stack>
        </div>
      ))}
    </Stack>
  );
}
