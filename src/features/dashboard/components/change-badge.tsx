import { Badge, type MantineSize } from '@mantine/core';
import { TrendingDown, TrendingUp } from 'lucide-react';

import { formatPercentChange } from '@/utils/number';

interface ChangeBadgeProps {
  change: number;
  size?: MantineSize;
}

export function ChangeBadge({ change, size = 'sm' }: ChangeBadgeProps) {
  const isPositive = change >= 0;
  const color = isPositive ? 'green' : 'red';
  const Icon = isPositive ? TrendingUp : TrendingDown;

  return (
    <Badge
      size={size}
      variant="light"
      color={color}
      leftSection={<Icon size={size === 'lg' ? 14 : 12} />}
    >
      {formatPercentChange(change)}
    </Badge>
  );
}
