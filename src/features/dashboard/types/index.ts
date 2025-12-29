export type DashboardPeriod = 'month' | 'year';

export interface StatMetric {
  current: number;
  previous: number;
  change: number;
}

export interface DashboardStatsResponse {
  totalRevenue: StatMetric;
  totalOrders: StatMetric;
  avgOrderValue: StatMetric;
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
