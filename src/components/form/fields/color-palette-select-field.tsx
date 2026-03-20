import { Group, Text, ColorSwatch, Select, Box } from '@mantine/core';
import type { SelectProps } from '@mantine/core';

import { getFieldError, useFieldContext } from '@/lib/form-context';

interface PaletteOption {
  id: number;
  name: string;
  colorPairs: { bg: string; fg: string }[];
}

type ColorPaletteSelectFieldProps = Omit<
  SelectProps,
  'value' | 'onChange' | 'data' | 'renderOption'
> & {
  colorPalettes: PaletteOption[];
};

export function ColorPaletteSelectField({
  colorPalettes,
  ...props
}: ColorPaletteSelectFieldProps) {
  const field = useFieldContext<number | null>();

  const paletteMap = new Map(colorPalettes.map((p) => [String(p.id), p]));

  const data = colorPalettes.map((p) => ({
    value: String(p.id),
    label: p.name,
  }));

  const renderOption: SelectProps['renderOption'] = ({ option }) => {
    const palette = paletteMap.get(option.value);

    return (
      <Group gap="sm" wrap="nowrap" py={4}>
        <Group gap={4}>
          {palette?.colorPairs.slice(0, 3).map((pair, index) => (
            <ColorSwatch
              key={`${pair.bg}-${index}`}
              color={pair.bg}
              size={20}
            />
          ))}
        </Group>
        <Text size="sm" truncate>
          {option.label}
        </Text>
      </Group>
    );
  };

  function toDisplayValue(value: number | null): string | null {
    if (value == null) return null;
    return String(value);
  }

  function fromDisplayValue(value: string | null): number | null {
    if (value == null) return null;
    const num = Number(value);
    return Number.isNaN(num) ? null : num;
  }

  const selectedPalette = paletteMap.get(String(field.state.value));

  return (
    <Box>
      <Select
        value={toDisplayValue(field.state.value)}
        onChange={(value) => field.handleChange(fromDisplayValue(value))}
        error={getFieldError(field.state.meta.errors)}
        data={data}
        renderOption={renderOption}
        {...props}
      />
      {selectedPalette && (
        <Group gap="xs" mt="xs" align="center">
          <Text size="xs" c="dimmed">
            Selected:
          </Text>
          <Group gap={4}>
            {selectedPalette.colorPairs.slice(0, 5).map((pair, index) => (
              <ColorSwatch
                key={`selected-${pair.bg}-${index}`}
                color={pair.bg}
                size={18}
              />
            ))}
          </Group>
          <Text size="xs" fw={500}>
            {selectedPalette.name}
          </Text>
        </Group>
      )}
    </Box>
  );
}
