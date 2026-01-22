import { createFileRoute } from '@tanstack/react-router';

import { OrderSuccessPage } from '@/features/customer';

export const Route = createFileRoute(
  '/_authenticated/_customer/order-success/$orderId'
)({
  component: RouteComponent,
});

function RouteComponent() {
  const { orderId } = Route.useParams();
  return <OrderSuccessPage orderId={Number(orderId)} />;
}
