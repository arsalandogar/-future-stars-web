import { SegmentedControl } from '@mantine/core';

import type { ColorTarget } from '../types';

interface StrokeTargetToggleProps {
  value: ColorTarget;
  onChange: (value: ColorTarget) => void;
  hasFill: boolean;
  hasStroke: boolean;
}

export function StrokeTargetToggle({
  value,
  onChange,
  hasFill,
  hasStroke,
}: StrokeTargetToggleProps) {
  if (!hasFill || !hasStroke) return null;

  return (
    <SegmentedControl
      size="xs"
      value={value}
      onChange={(v) => onChange(v as ColorTarget)}
      data={[
        { label: 'Fill', value: 'fill' },
        { label: 'Stroke', value: 'stroke' },
      ]}
    />
  );
}
