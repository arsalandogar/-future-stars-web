import { ColorSwatch, Group, Select } from '@mantine/core';
import { Check } from 'lucide-react';

import type { EditableFieldId } from '@/features/templates';

import type { ColorAreaOption } from '../hooks/use-color-area-options';

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
  if (colorAreaOptions.length === 0) return null;

  return (
    <Select
      mt={mt}
      size="xs"
      label={label}
      description={description}
      placeholder="None"
      clearable
      data={colorAreaOptions}
      value={currentValue ?? null}
      onChange={(value) => onChange((value as EditableFieldId) || undefined)}
      renderOption={({ option, checked }) => {
        const opt = colorAreaOptions.find((o) => o.value === option.value);
        return (
          <Group gap="xs" wrap="nowrap">
            {opt?.hex && (
              <ColorSwatch color={opt.hex} size={14} withShadow={false} />
            )}
            <span>{option.label}</span>
            {checked && <Check size={12} style={{ marginLeft: 'auto' }} />}
          </Group>
        );
      }}
      leftSection={(() => {
        if (!currentValue) return null;
        const opt = colorAreaOptions.find((o) => o.value === currentValue);
        return opt?.hex ? (
          <ColorSwatch color={opt.hex} size={12} withShadow={false} />
        ) : null;
      })()}
    />
  );
}
