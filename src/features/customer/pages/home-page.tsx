import { useSuspenseQuery } from '@tanstack/react-query';

import { Head } from '@/components/seo/head';

import { customerFeaturedItemsQuery } from '../api/get-featured-items';
import { FeaturedCarousel } from '../components/featured-carousel';

export function HomePage() {
  const { data } = useSuspenseQuery(customerFeaturedItemsQuery.getOptions());

  return (
    <>
      <Head title="Home" description="Create professional-grade sports cards" />
      <FeaturedCarousel items={data.data} />
    </>
  );
}
