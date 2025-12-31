import { Card, Skeleton, Text } from '@mantine/core';

import { CHART_HEIGHT } from '../constants';

import { ChangeBadge } from './change-badge';

interface ChartCardProps {
  title: string;
  description: string;
  change?: number;
  isLoading?: boolean;
  isError?: boolean;
  children: React.ReactNode;
  'aria-label'?: string;
}

export function ChartCard({
  title,
  description,
  change,
  isLoading,
  isError,
  children,
  'aria-label': ariaLabel,
}: ChartCardProps) {
  return (
    <Card
      className="flex h-full flex-col"
      p="lg"
      radius="md"
      withBorder
      aria-label={ariaLabel}
    >
      <div className="mb-4 flex items-start justify-between">
        <div>
          <Text fw={600} size="lg">
            {title}
          </Text>
          <Text c="dimmed" size="sm">
            {description}
          </Text>
        </div>
        {change !== undefined && <ChangeBadge change={change} size="lg" />}
      </div>
      {isLoading ? (
        <Skeleton height={CHART_HEIGHT} />
      ) : isError ? (
        <div className="flex h-62.5 items-center justify-center">
          <Text c="dimmed" size="sm">
            Failed to load chart data
          </Text>
        </div>
      ) : (
        children
      )}
    </Card>
  );
}
