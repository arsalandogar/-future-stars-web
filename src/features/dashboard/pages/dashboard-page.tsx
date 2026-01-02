import { Head } from '@/components/seo/head';

import { DashboardContent } from '../components/dashboard-content';

export function DashboardPage() {
  return (
    <>
      <Head description="Admin dashboard" title="Admin Dashboard" />
      <DashboardContent />
    </>
  );
}
