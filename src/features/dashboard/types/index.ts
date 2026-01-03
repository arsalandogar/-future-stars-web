export type DashboardPeriod = 'month' | 'year';

export interface StatMetric {
  current: number;
  previous: number;
  change: number;
}

export interface DashboardStats {
  totalRevenue: StatMetric;
  totalOrders: StatMetric;
  avgOrderValue: StatMetric;
}

export interface DashboardStatsResponse {
  data: DashboardStats;
}

export interface DashboardStatsParams {
  period?: DashboardPeriod;
}

export interface GraphDataPoint {
  month: string;
  value: number;
}

export interface GraphResponse {
  data: GraphDataPoint[];
}
