import { createFileRoute } from '@tanstack/react-router';

import { HomePage, customerFeaturedItemsQuery } from '@/features/customer';

export const Route = createFileRoute('/_authenticated/_customer/')({
  loader: ({ context: { queryClient } }) =>
    queryClient.ensureQueryData(customerFeaturedItemsQuery.getOptions()),
  component: HomePage,
});
