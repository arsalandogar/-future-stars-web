import { createFileRoute } from '@tanstack/react-router';

import { HomePage } from '@/features/customer';

export const Route = createFileRoute('/_authenticated/_customer/')({
  component: HomePage,
});
