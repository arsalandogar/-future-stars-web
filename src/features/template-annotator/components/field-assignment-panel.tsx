import { useMemo } from 'react';
import { ScrollArea, Stack, Text, ThemeIcon } from '@mantine/core';
import { MousePointerClick } from 'lucide-react';

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
              <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
                Selected Element
              </Text>
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
