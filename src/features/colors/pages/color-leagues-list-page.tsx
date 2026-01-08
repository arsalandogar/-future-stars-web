import { Head } from '@/components/seo/head';

import { ColorLeaguesList } from '../components/color-leagues-list';

export function ColorLeaguesPage() {
  return (
    <>
      <Head title="Color Leagues" description="Manage Color Leagues" />
      <ColorLeaguesList />
    </>
  );
}
