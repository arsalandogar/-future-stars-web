import { Text } from '@mantine/core';

import { formatCompactNumber } from '../utils/format-compact-number';

interface BoundsDisplayItem {
  label: string;
  value: number;
}

interface BoundsDisplayProps {
  items: BoundsDisplayItem[];
}

export function BoundsDisplay({ items }: BoundsDisplayProps) {
  return (
    <div className="flex items-center gap-1 flex-wrap">
      {items.map(({ label, value }, i) => (
        <span key={label} className="flex items-center gap-1">
          {i > 0 && (
            <Text span size="xs" c="dimmed">
              &middot;
            </Text>
          )}
          <Text span size="xs" c="dimmed" tt="uppercase" fw={600}>
            {label}
          </Text>
          <Text span size="xs">
            {formatCompactNumber(value)}
          </Text>
        </span>
      ))}
    </div>
  );
}
