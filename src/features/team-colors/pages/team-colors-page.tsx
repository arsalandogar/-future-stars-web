import { Head } from '@/components/seo/head';
import { usePageHeader } from '@/hooks/use-page-header';

import { TeamColorsLayout } from '../components/team-colors-layout';

export function TeamColorsPage() {
  usePageHeader({
    title: 'Team Colors List',
    description: 'Manage team color palettes and preview templates',
  });

  return (
    <>
      <Head title="Team Colors List" description="Manage team color palettes" />
      <TeamColorsLayout />
    </>
  );
}
