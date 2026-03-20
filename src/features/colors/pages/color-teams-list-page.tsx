import { Head } from '@/components/seo/head';

import { ColorTeamsList } from '../components/color-teams-list';

export function ColorTeamsListPage() {
  return (
    <>
      <Head title="Color Teams" description="Manage Color Teams" />
      <ColorTeamsList />
    </>
  );
}
