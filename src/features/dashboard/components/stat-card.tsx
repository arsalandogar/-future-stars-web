import { Card, Text, ThemeIcon, type MantineColor } from '@mantine/core';
import type { ComponentType } from 'react';

import { ChangeBadge } from './change-badge';

interface StatCardProps {
  icon: ComponentType<{ size: number }>;
  label: string;
  value: string;
  change?: number;
  color: MantineColor;
}

export function StatCard({
  icon: Icon,
  label,
  value,
  change,
  color,
}: StatCardProps) {
  const ariaLabel =
    change !== undefined
      ? `${label}: ${value}, ${change >= 0 ? 'up' : 'down'} ${Math.abs(change).toFixed(1)}% from previous period`
      : `${label}: ${value}`;

  return (
    <Card aria-label={ariaLabel} p="lg" radius="md" withBorder>
      <div className="flex items-start gap-3">
        <ThemeIcon color={color} radius="md" size={48} variant="light">
          <Icon size={24} />
        </ThemeIcon>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <Text c="dimmed" size="sm">
              {label}
            </Text>
            {change !== undefined && <ChangeBadge change={change} />}
          </div>
          <Text fw={700} mt={4} size="xl">
            {value}
          </Text>
        </div>
      </div>
    </Card>
  );
}
