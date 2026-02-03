import { Head } from '@/components/seo/head';

import { AddToBatchModal } from '@/features/print-batches';

import { OrdersList } from '../components/orders-list';

export function OrdersListPage() {
  return (
    <>
      <Head title="Orders" description="Manage orders" />
      <AddToBatchModal />
      <OrdersList />
    </>
  );
}
