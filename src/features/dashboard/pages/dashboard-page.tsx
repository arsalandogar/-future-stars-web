import { Head } from '@/components/seo/head';
import { usePageHeader } from '@/hooks/use-page-header';

import { DashboardContent } from '../components/dashboard-content';

export function DashboardPage() {
  usePageHeader({
    title: 'Dashboard',
    description: "Overview of your store's performance.",
  });

  return (
    <>
      <Head description="Admin dashboard" title="Admin Dashboard" />
      <DashboardContent />
    </>
  );
}
