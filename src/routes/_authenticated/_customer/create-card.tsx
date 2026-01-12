import { createFileRoute } from '@tanstack/react-router';

import { CreateCardPage } from '@/features/customer';

export const Route = createFileRoute('/_authenticated/_customer/create-card')({
  component: CreateCardPage,
});
