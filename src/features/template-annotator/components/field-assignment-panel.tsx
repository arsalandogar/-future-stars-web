import { useMemo } from 'react';
import { ScrollArea, Stack, Text } from '@mantine/core';

import { EDITABLE_FIELDS } from '@/features/templates';

import { useAnnotatorStore } from '../stores/annotator-store';
import { supportsTouchBounds } from '../utils/svg-node-helpers';
import { FieldPicker } from './field-picker';
import { TouchBoundsControls } from './touch-bounds-controls';

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
          <Text size="sm" c="dimmed" ta="center" py="xl">
            Select an element to assign fields
          </Text>
        ) : (
          <>
            <div>
              <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
                Selected Element
              </Text>
              <Text size="sm" fw={500} mt={2}>
                &lt;{meta.tagName}&gt; {meta.label}
              </Text>
            </div>

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
