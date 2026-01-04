import { Head } from '@/components/seo/head';

import { OrdersList } from '../components/orders-list';

export function OrdersListPage() {
  return (
    <>
      <Head title="Orders" description="Manage orders" />
      <OrdersList />
    </>
  );
}
