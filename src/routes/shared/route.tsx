import { createFileRoute } from '@tanstack/react-router';

import { SharedLinkLayout } from '@/app/layouts/customer';

export const Route = createFileRoute('/shared')({
  component: SharedLinkLayout,
});
