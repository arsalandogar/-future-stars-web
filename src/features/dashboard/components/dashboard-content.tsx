import { lazy, Suspense } from 'react';

import { SegmentedControl, Skeleton, Text } from '@mantine/core';
import { getRouteApi } from '@tanstack/react-router';
import { Clock, DollarSign, TrendingUp } from 'lucide-react';
import { MdOutlineShoppingCart } from 'react-icons/md';

import { formatCurrency } from '@/utils/currency';
import { formatNumber } from '@/utils/number';

import { useDashboardStats } from '../api/get-dashboard-stats';
import { useOrdersGraph } from '../api/get-orders-graph';
import { useRevenueGraph } from '../api/get-revenue-graph';
import { PERIOD_OPTIONS, STAT_COLORS } from '../constants';
import type { DashboardPeriod } from '../types';

import { StatCard } from './stat-card';

const RevenueChart = lazy(() =>
  import('./revenue-chart').then((m) => ({ default: m.RevenueChart }))
);
const OrdersChart = lazy(() =>
  import('./orders-chart').then((m) => ({ default: m.OrdersChart }))
);

const routeApi = getRouteApi('/_authenticated/admin/');

export function DashboardContent() {
  const { period } = routeApi.useSearch();
  const navigate = routeApi.useNavigate();

  const handlePeriodChange = (newPeriod: string) => {
    void navigate({
      search: { period: newPeriod as DashboardPeriod },
      replace: true,
    });
  };

  const {
    data: statsResponse,
    isLoading: statsLoading,
    isError: statsError,
  } = useDashboardStats({ variables: { period } });
  const stats = statsResponse?.data;

  const {
    data: revenueData,
    isLoading: revenueLoading,
    isError: revenueError,
  } = useRevenueGraph();

  const {
    data: ordersData,
    isLoading: ordersLoading,
    isError: ordersError,
  } = useOrdersGraph();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-1 justify-end">
        <SegmentedControl
          data={PERIOD_OPTIONS}
          onChange={handlePeriodChange}
          value={period}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statsLoading ? (
          <>
            <Skeleton height={100} radius="md" />
            <Skeleton height={100} radius="md" />
            <Skeleton height={100} radius="md" />
            <Skeleton height={100} radius="md" />
          </>
        ) : statsError ? (
          <div className="col-span-full">
            <Text c="red" ta="center">
              Failed to load dashboard statistics. Please try again.
            </Text>
          </div>
        ) : (
          <>
            <StatCard
              change={stats?.totalRevenue.change}
              color={STAT_COLORS.revenue}
              icon={DollarSign}
              label="Total Revenue"
              value={
                stats ? formatCurrency(stats.totalRevenue.current) : '$0.00'
              }
            />
            <StatCard
              change={stats?.totalOrders.change}
              color={STAT_COLORS.orders}
              icon={MdOutlineShoppingCart}
              label="Total Orders"
              value={stats ? formatNumber(stats.totalOrders.current) : '0'}
            />
            <StatCard
              color={STAT_COLORS.pending}
              icon={Clock}
              label="Pending Processing"
              value="--"
            />
            <StatCard
              change={stats?.avgOrderValue.change}
              color={STAT_COLORS.average}
              icon={TrendingUp}
              label="Avg. Order Value"
              value={
                stats ? formatCurrency(stats.avgOrderValue.current) : '$0.00'
              }
            />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Suspense fallback={<Skeleton height={350} radius="md" />}>
          <RevenueChart
            change={stats?.totalRevenue.change}
            data={revenueData?.data ?? []}
            isError={revenueError}
            isLoading={revenueLoading}
          />
        </Suspense>
        <Suspense fallback={<Skeleton height={350} radius="md" />}>
          <OrdersChart
            change={stats?.totalOrders.change}
            data={ordersData?.data ?? []}
            isError={ordersError}
            isLoading={ordersLoading}
          />
        </Suspense>
      </div>
    </div>
  );
}
