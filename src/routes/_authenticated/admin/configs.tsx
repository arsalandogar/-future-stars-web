import { createFileRoute } from '@tanstack/react-router';

import { ConfigsListPage } from '@/features/configs';

export const Route = createFileRoute('/_authenticated/admin/configs')({
  component: ConfigsListPage,
});
