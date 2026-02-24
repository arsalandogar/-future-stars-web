import { createFileRoute } from '@tanstack/react-router';

import { HomePage, useCustomerFeaturedItems } from '@/features/customer';

export const Route = createFileRoute('/_authenticated/_customer/')({
  loader: ({ context: { queryClient } }) =>
    queryClient.ensureQueryData(useCustomerFeaturedItems.getOptions()),
  component: HomePage,
});
