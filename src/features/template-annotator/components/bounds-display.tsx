import { SimpleGrid, Text } from '@mantine/core';

import type { TouchBounds } from '../types';
import { formatCompactNumber } from '../utils/format-compact-number';

const LABELS: Record<keyof TouchBounds, string> = {
  x: 'X',
  y: 'Y',
  width: 'W',
  height: 'H',
};

interface BoundsDisplayProps {
  bounds: TouchBounds;
}

export function BoundsDisplay({ bounds }: BoundsDisplayProps) {
  return (
    <SimpleGrid cols={4} spacing={4} mt="xs">
      {(['x', 'y', 'width', 'height'] as const).map((key) => (
        <Text key={key} size="xs" c="dimmed" ta="center">
          <Text span tt="uppercase" fw={600}>
            {LABELS[key]}
          </Text>{' '}
          {formatCompactNumber(bounds[key])}
        </Text>
      ))}
    </SimpleGrid>
  );
}
