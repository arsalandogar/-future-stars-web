import { BarChart } from '@mantine/charts';

import { formatMonthShort } from '@/utils/date';

import { CHART_HEIGHT } from '../constants';
import type { GraphDataPoint } from '../types';

import { ChartCard } from './chart-card';

interface OrdersChartProps {
  data: GraphDataPoint[];
  change?: number;
  isLoading?: boolean;
  isError?: boolean;
}

export function OrdersChart({
  data,
  change,
  isLoading,
  isError,
}: OrdersChartProps) {
  const chartData = data.map((point) => ({
    month: formatMonthShort(point.month),
    Orders: point.value,
  }));

  return (
    <ChartCard
      aria-label="Order volume chart showing total orders delivered"
      change={change}
      description="Total orders delivered"
      isError={isError}
      isLoading={isLoading}
      title="Order Volume"
    >
      <BarChart
        data={chartData}
        dataKey="month"
        gridAxis="xy"
        h={CHART_HEIGHT}
        series={[{ name: 'Orders', color: 'blue.6' }]}
      />
    </ChartCard>
  );
}
