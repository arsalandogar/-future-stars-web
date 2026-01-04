import { Head } from '@/components/seo/head';

import { FeaturedItemsList } from '../components/featured-items-list';

export function FeaturedItemsListPage() {
  return (
    <>
      <Head title="Featured Items" description="Manage Featured Items" />
      <FeaturedItemsList />
    </>
  );
}
