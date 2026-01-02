import { Head } from '@/components/seo/head';
import { ColorLeaguesList } from '../color-leagues';

export function ColorLeaguesPage() {
  return (
    <>
      <Head title="Color Leagues" description="Manage Color Leagues" />
      <ColorLeaguesList />
    </>
  );
}
