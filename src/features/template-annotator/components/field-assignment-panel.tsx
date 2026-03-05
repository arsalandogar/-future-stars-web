import { useMemo } from 'react';
import { ActionIcon, ScrollArea, Stack, Text, ThemeIcon } from '@mantine/core';
import { modals } from '@mantine/modals';
import { MousePointerClick, Trash2 } from 'lucide-react';

import { EDITABLE_FIELDS } from '@/features/templates';

import { useAnnotatorStore } from '../stores/annotator-store';
import { supportsTouchBounds } from '../utils/svg-node-helpers';
import { FieldPicker } from './field-picker';
import { TouchBoundsControls } from './touch-bounds-controls';
import { TransformControls } from './transform-controls';

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
            <div>
              <div className="flex items-center justify-between">
                <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
                  Selected Element
                </Text>
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
                            This will permanently remove the element and all its
                            children from the SVG tree. You can undo this
                            action.
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
              <Text size="sm" fw={500} mt={2}>
                {meta.label}
              </Text>
            </div>

            <TransformControls nodeMeta={meta} />

            <FieldPicker nodeMeta={meta} />

            {touchBoundsAssignment && (
              <TouchBoundsControls
                nodeMeta={meta}
                fieldId={touchBoundsAssignment.fieldId}
              />
            )}
          </>
        )}
      </Stack>
    </ScrollArea>
  );
}
