import { Head } from '@/components/seo/head';

import { LeaguesList } from '../components/leagues-list';

export function LeaguesListPage() {
  return (
    <>
      <Head title="Leagues" description="Manage Leagues" />
      <LeaguesList />
    </>
  );
}
