import { createFileRoute, stripSearchParams } from '@tanstack/react-router';
import * as v from 'valibot';

import { DashboardPage, type DashboardPeriod } from '@/features/dashboard';

const defaultValues: { period: DashboardPeriod } = {
  period: 'month',
};

const dashboardSearchSchema = v.object({
  period: v.fallback(v.picklist(['month', 'year']), 'month'),
});

export const Route = createFileRoute('/_authenticated/admin/')({
  component: DashboardPage,
  validateSearch: dashboardSearchSchema,
  search: {
    middlewares: [stripSearchParams(defaultValues)],
  },
});
