import { useMemo } from 'react';
import {
  ActionIcon,
  Divider,
  ScrollArea,
  Stack,
  Text,
  ThemeIcon,
} from '@mantine/core';
import { modals } from '@mantine/modals';
import { Image, MousePointerClick, Palette, Trash2, Type } from 'lucide-react';

import { EDITABLE_FIELDS } from '@/features/templates';

import type { NodeMeta } from '../types';
import { useAnnotatorStore } from '../stores/annotator-store';
import { supportsTouchBounds } from '../utils/svg-node-helpers';
import { FieldPicker } from './field-picker';
import { TouchBoundsControls } from './touch-bounds-controls';
import { TransformControls } from './transform-controls';

import styles from './field-assignment-panel.module.css';

function getElementType(meta: NodeMeta): 'text' | 'image' | 'color' | null {
  if (meta.isTextElement) return 'text';
  if (meta.isImageElement) return 'image';
  if (meta.hasFill || meta.hasStroke || meta.hasStopColor) return 'color';
  return null;
}

const TYPE_ICONS = {
  text: { icon: Type, color: 'blue' },
  image: { icon: Image, color: 'green' },
  color: { icon: Palette, color: 'violet' },
} as const;

function SelectedElementHeader({ meta }: { meta: NodeMeta }) {
  const elementType = getElementType(meta);
  const typeConfig = elementType ? TYPE_ICONS[elementType] : null;

  // Split label into tag portion and rest
  const labelMatch = meta.label.match(/^(<[^>]+>)(.*)/);

  return (
    <div className={styles.selectedElement} data-type={elementType}>
      {typeConfig && (
        <ThemeIcon
          size={24}
          radius="sm"
          variant="light"
          color={typeConfig.color}
          className={styles.elementIcon}
        >
          <typeConfig.icon size={14} />
        </ThemeIcon>
      )}
      <div className={styles.elementInfo}>
        <Text size="sm" fw={500} truncate>
          {labelMatch ? (
            <>
              <span className={styles.tagName}>{labelMatch[1]}</span>
              {labelMatch[2]}
            </>
          ) : (
            meta.label
          )}
        </Text>
      </div>
      {meta.parentNodeId !== null && (
        <ActionIcon
          variant="subtle"
          color="red"
          size="sm"
          onClick={() =>
            modals.openConfirmModal({
              title: 'Delete this element?',
              children: (
                <Text size="sm">
                  This will permanently remove the element and all its children
                  from the SVG tree. You can undo this action.
                </Text>
              ),
              labels: { confirm: 'Delete', cancel: 'Cancel' },
              confirmProps: { color: 'red' },
              onConfirm: () =>
                useAnnotatorStore.getState().deleteNode(meta.nodeId),
            })
          }
        >
          <Trash2 size={14} />
        </ActionIcon>
      )}
    </div>
  );
}

export function FieldAssignmentPanel() {
  const selectedNodeId = useAnnotatorStore((s) => s.selectedNodeId);
  const nodeIndex = useAnnotatorStore((s) => s.nodeIndex);
  const assignments = useAnnotatorStore((s) => s.assignments);

  const meta = selectedNodeId ? nodeIndex.get(selectedNodeId) : undefined;

  // Find a text/image assignment on the selected node for touch bounds controls
  const touchBoundsAssignment = useMemo(() => {
    if (!selectedNodeId) return null;
    return (
      assignments.find((a) => {
        if (a.nodeId !== selectedNodeId) return false;
        return supportsTouchBounds(EDITABLE_FIELDS[a.fieldId].type);
      }) || null
    );
  }, [selectedNodeId, assignments]);

  // Find a text assignment on the selected node for text area controls
  const textAssignment = useMemo(() => {
    if (!selectedNodeId) return null;
    return (
      assignments.find((a) => {
        if (a.nodeId !== selectedNodeId) return false;
        return EDITABLE_FIELDS[a.fieldId].type === 'text';
      }) || null
    );
  }, [selectedNodeId, assignments]);

  return (
    <ScrollArea h="100%">
      <Stack gap="md" p="md">
        {!meta ? (
          <Stack align="center" gap="sm" py="xl">
            <ThemeIcon variant="light" size="xl" radius="xl" color="gray">
              <MousePointerClick size={20} />
            </ThemeIcon>
            <Text size="sm" c="dimmed" ta="center" maw={220}>
              Click an element on the canvas or tree to assign fields
            </Text>
          </Stack>
        ) : (
          <>
            <SelectedElementHeader meta={meta} />

            <TransformControls
              nodeMeta={meta}
              fieldId={textAssignment?.fieldId}
            />

            <div
              className={styles.touchBoundsWrapper}
              data-visible={!!touchBoundsAssignment}
            >
              {touchBoundsAssignment && (
                <TouchBoundsControls
                  nodeMeta={meta}
                  fieldId={touchBoundsAssignment.fieldId}
                />
              )}
            </div>

            <Divider />

            <FieldPicker nodeMeta={meta} />
          </>
        )}
      </Stack>
    </ScrollArea>
  );
}
