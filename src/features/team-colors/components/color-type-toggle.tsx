import { SegmentedControl } from '@mantine/core';

interface ColorTypeToggleProps {
  value: 'colors' | 'text';
  onChange: (value: 'colors' | 'text') => void;
}

export function ColorTypeToggle({ value, onChange }: ColorTypeToggleProps) {
  return (
    <SegmentedControl
      value={value}
      onChange={(val) => onChange(val as 'colors' | 'text')}
      data={[
        { label: 'COLORS', value: 'colors' },
        { label: 'TEXT', value: 'text' },
      ]}
      size="xs"
    />
  );
}
