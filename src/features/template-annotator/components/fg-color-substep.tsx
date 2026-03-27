import { ColorInput, ScrollArea, Stack, Text } from '@mantine/core';

import type { EditableFieldId } from '@/features/templates';

import type { ColorAreaBrief } from './detection-wizard-modal';

interface FgColorSubStepProps {
  colorAreas: ColorAreaBrief[];
  fgSelections: Record<string, string>;
  onFgChange: (fieldId: EditableFieldId, hex: string) => void;
  bgSelections: Record<string, string>;
  onBgChange: (fieldId: EditableFieldId, hex: string) => void;
}

export function FgColorSubStep({
  colorAreas,
  fgSelections,
  onFgChange,
  bgSelections,
  onBgChange,
}: FgColorSubStepProps) {
  return (
    <Stack gap="md">
      <Text size="sm" c="dimmed">
        Set the background and foreground (text) color for each color area. This
        defines the template&apos;s default palette.
      </Text>

      <ScrollArea.Autosize mah={300}>
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="pb-1.5 text-left">
                <Text size="xs" c="dimmed" fw={600}>
                  Area
                </Text>
              </th>
              <th className="pb-1.5 text-left">
                <Text size="xs" c="dimmed" fw={600}>
                  BG color
                </Text>
              </th>
              <th className="pb-1.5 text-left">
                <Text size="xs" c="dimmed" fw={600}>
                  Text color
                </Text>
              </th>
            </tr>
          </thead>
          <tbody>
            {colorAreas.map(({ fieldId, label, bgHex }) => (
              <tr key={fieldId}>
                <td className="whitespace-nowrap py-1 pr-2 align-middle">
                  <Text size="sm">{label}</Text>
                </td>
                <td className="py-1 pr-2 align-middle">
                  <ColorInput
                    size="xs"
                    value={bgSelections[fieldId] ?? bgHex}
                    onChange={(v) => onBgChange(fieldId, v)}
                    withEyeDropper={false}
                    format="hex"
                  />
                </td>
                <td className="py-1 align-middle">
                  <ColorInput
                    size="xs"
                    value={fgSelections[fieldId] ?? '#ffffff'}
                    onChange={(v) => onFgChange(fieldId, v)}
                    withEyeDropper={false}
                    format="hex"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </ScrollArea.Autosize>
    </Stack>
  );
}
