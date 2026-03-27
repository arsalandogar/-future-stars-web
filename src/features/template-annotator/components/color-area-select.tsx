import { ColorSwatch, Group, Select } from '@mantine/core';
import { Check } from 'lucide-react';

import type { EditableFieldId } from '@/features/templates';

import type { ColorAreaOption } from '../hooks/use-color-area-options';
import { useAnnotatorStore } from '../stores/annotator-store';

export function ColorAreaSelect({
  currentValue,
  colorAreaOptions,
  onChange,
  mt,
  label,
  description,
}: {
  currentValue?: EditableFieldId;
  colorAreaOptions: ColorAreaOption[];
  onChange: (value: EditableFieldId | undefined) => void;
  mt?: string;
  label?: string;
  description?: string;
}) {
  const hoverHighlightField = useAnnotatorStore((s) => s.hoverHighlightField);

  if (colorAreaOptions.length === 0) return null;

  return (
    <Group gap={4} align="end" mt={mt} wrap="nowrap">
      <Select
        size="xs"
        label={label}
        description={description}
        placeholder="None"
        clearable
        data={colorAreaOptions}
        value={currentValue ?? null}
        onChange={(value) => onChange((value as EditableFieldId) || undefined)}
        onDropdownClose={() => hoverHighlightField(null)}
        style={{ flex: 1 }}
        renderOption={({ option, checked }) => {
          const opt = colorAreaOptions.find((o) => o.value === option.value);
          return (
            <Group
              gap="xs"
              wrap="nowrap"
              style={{ width: '100%' }}
              onMouseEnter={() =>
                hoverHighlightField(option.value as EditableFieldId)
              }
              onMouseLeave={() => hoverHighlightField(null)}
            >
              {opt?.hex && (
                <Group gap={2} wrap="nowrap">
                  <ColorSwatch color={opt.hex} size={14} withShadow={false} />
                  {opt.fgHex && (
                    <ColorSwatch
                      color={opt.fgHex}
                      size={14}
                      withShadow={false}
                    />
                  )}
                </Group>
              )}
              <span>{option.label}</span>
              {checked && <Check size={12} style={{ marginLeft: 'auto' }} />}
            </Group>
          );
        }}
        leftSection={(() => {
          if (!currentValue) return null;
          const opt = colorAreaOptions.find((o) => o.value === currentValue);
          if (!opt?.hex) return null;
          return (
            <Group gap={2} wrap="nowrap">
              <ColorSwatch color={opt.hex} size={12} withShadow={false} />
              {opt.fgHex && (
                <ColorSwatch color={opt.fgHex} size={12} withShadow={false} />
              )}
            </Group>
          );
        })()}
      />
    </Group>
  );
}
