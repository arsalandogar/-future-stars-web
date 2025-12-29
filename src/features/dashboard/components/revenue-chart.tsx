import { AreaChart } from '@mantine/charts';

import { formatCurrencyCompact } from '@/utils/currency';
import { formatMonthShort } from '@/utils/date';

import { CHART_HEIGHT } from '../constants';
import type { GraphDataPoint } from '../types';

import { ChartCard } from './chart-card';

interface RevenueChartProps {
  data: GraphDataPoint[];
  change?: number;
  isLoading?: boolean;
  isError?: boolean;
}

export function RevenueChart({
  data,
  change,
  isLoading,
  isError,
}: RevenueChartProps) {
  const chartData = data.map((point) => ({
    month: formatMonthShort(point.month),
    Revenue: point.value / 100,
  }));

  return (
    <ChartCard
      aria-label="Revenue chart showing monthly revenue performance"
      change={change}
      description="Monthly revenue performance"
      isError={isError}
      isLoading={isLoading}
      title="Total Revenue"
    >
      <AreaChart
        curveType="monotone"
        data={chartData}
        dataKey="month"
        gridAxis="xy"
        h={CHART_HEIGHT}
        series={[{ name: 'Revenue', color: 'green.6' }]}
        valueFormatter={(value) => formatCurrencyCompact(value * 100)}
        withDots={false}
      />
    </ChartCard>
  );
}
