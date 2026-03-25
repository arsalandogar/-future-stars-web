import {
  ColorInput,
  ColorSwatch,
  Group,
  ScrollArea,
  Stack,
  Text,
} from '@mantine/core';

import type { EditableFieldId } from '@/features/templates';

import type { ColorAreaBrief } from './detection-wizard-modal';

interface FgColorSubStepProps {
  colorAreas: ColorAreaBrief[];
  fgSelections: Record<string, string>;
  onFgChange: (fieldId: EditableFieldId, hex: string) => void;
}

export function FgColorSubStep({
  colorAreas,
  fgSelections,
  onFgChange,
}: FgColorSubStepProps) {
  return (
    <Stack gap="md">
      <Text size="sm" c="dimmed">
        Set the foreground (text) color for each color area. This defines the
        template&apos;s default palette.
      </Text>

      <ScrollArea.Autosize mah={300}>
        <Stack gap="sm">
          {colorAreas.map(({ fieldId, label, bgHex }) => (
            <Group key={fieldId} gap="sm" wrap="nowrap" align="end">
              <ColorSwatch color={bgHex} size={20} withShadow={false} />
              <Text size="sm" style={{ minWidth: 60 }}>
                {label}
              </Text>
              <ColorInput
                size="xs"
                value={fgSelections[fieldId] ?? '#ffffff'}
                onChange={(v) => onFgChange(fieldId, v)}
                withEyeDropper={false}
                format="hex"
                style={{ flex: 1 }}
                label="Text color"
              />
            </Group>
          ))}
        </Stack>
      </ScrollArea.Autosize>
    </Stack>
  );
}
