import { createFileRoute, stripSearchParams } from '@tanstack/react-router';
import * as v from 'valibot';

import { Head } from '@/components/seo/head';
import { DashboardContent, type DashboardPeriod } from '@/features/dashboard';

const defaultValues: { period: DashboardPeriod } = {
  period: 'month',
};

const dashboardSearchSchema = v.object({
  period: v.fallback(v.picklist(['month', 'year']), 'month'),
});

export const Route = createFileRoute('/_authenticated/admin/')({
  component: AdminDashboard,
  validateSearch: dashboardSearchSchema,
  search: {
    middlewares: [stripSearchParams(defaultValues)],
  },
});

function AdminDashboard() {
  return (
    <>
      <Head description="Admin dashboard" title="Admin Dashboard" />
      <DashboardContent />
    </>
  );
}
