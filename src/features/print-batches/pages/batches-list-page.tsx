import { Head } from '@/components/seo/head';

import { BatchesList } from '../components/batches-list';

export function BatchesListPage() {
  return (
    <>
      <Head title="Batches" description="Manage print batches" />
      <BatchesList />
    </>
  );
}
