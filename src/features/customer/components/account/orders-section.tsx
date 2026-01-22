import { Button, Collapse, Loader, Text, Title } from '@mantine/core';
import { ChevronDown, ChevronUp, SlidersHorizontal, Truck } from 'lucide-react';
import { useState } from 'react';

import { type Order, type OrderStatus, useOrders } from '../../api/get-orders';
import { OrderPackItem } from '../order-pack-item';
import styles from './account-section.module.css';
import orderStyles from './orders-section.module.css';

const STATUS_COLORS: Record<OrderStatus, string> = {
  created: 'var(--mantine-color-yellow-6)',
  payment_failed: 'var(--mantine-color-red-6)',
  paid: 'var(--mantine-color-green-6)',
  processing: 'var(--mantine-color-blue-6)',
  sent_to_production: 'var(--mantine-color-blue-6)',
  shipped: 'var(--mantine-color-blue-6)',
  delivered: 'var(--mantine-color-gray-6)',
  cancelled: 'var(--mantine-color-red-6)',
  refunded: 'var(--mantine-color-orange-6)',
};

const STATUS_LABELS: Record<OrderStatus, string> = {
  created: 'Created',
  payment_failed: 'Payment Failed',
  paid: 'Paid',
  processing: 'Processing',
  sent_to_production: 'In Production',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  refunded: 'Refunded',
};

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

function getPackCount(order: Order): number {
  return order.lineItems.reduce((sum, item) => sum + item.quantity, 0);
}

export function OrdersSection() {
  const { data, isLoading } = useOrders();
  const orders = data?.data ?? [];

  if (isLoading) {
    return (
      <div>
        <div className={styles.header}>
          <div>
            <Title order={2} c="white" fw={800} className={styles.title}>
              My Orders
            </Title>
            <Text component="span" c="dimmed" size="md" display="block">
              {orders.length} Orders
            </Text>
          </div>
        </div>
        <div className={styles.card} style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
          <Loader size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className={styles.header}>
        <div>
          <Title order={2} c="white" fw={800} className={styles.title}>
            My Orders
          </Title>
          <Text component="span" c="dimmed" size="md" display="block">
            {orders.length} Orders
          </Text>
        </div>
        <Button
          variant="default"
          radius="xl"
          leftSection={<SlidersHorizontal size={16} />}
          disabled
        >
          Filters
        </Button>
      </div>

      {orders.length === 0 ? (
        <div className={styles.card}>
          <Text c="dimmed" ta="center" py="xl">
            No orders yet
          </Text>
        </div>
      ) : (
        <div className={styles.card}>
          <div className={orderStyles.ordersList}>
            {orders.map((order, index) => (
              <OrderCard key={order.id} order={order} isLast={index === orders.length - 1} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface OrderCardProps {
  order: Order;
  isLast: boolean;
}

function OrderCard({ order, isLast }: OrderCardProps) {
  const [expanded, setExpanded] = useState(false);
  const packCount = getPackCount(order);

  const handleTrackingClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (order.trackingNumber) {
      let trackingUrl = '';
      const carrier = order.trackingCarrier?.toLowerCase() ?? '';
      if (carrier.includes('usps')) {
        trackingUrl = `https://tools.usps.com/go/TrackConfirmAction?tLabels=${order.trackingNumber}`;
      } else if (carrier.includes('fedex')) {
        trackingUrl = `https://www.fedex.com/fedextrack/?trknbr=${order.trackingNumber}`;
      } else if (carrier.includes('ups')) {
        trackingUrl = `https://www.ups.com/track?tracknum=${order.trackingNumber}`;
      }
      if (trackingUrl) {
        window.open(trackingUrl, '_blank');
      }
    }
  };

  // Calculate subtotal from line items
  const subtotal = order.lineItems.reduce((sum, item) => sum + item.totalPrice, 0);

  return (
    <div className={`${orderStyles.orderCard} ${isLast ? '' : orderStyles.withDivider}`}>
      <button
        type="button"
        className={orderStyles.orderHeader}
        onClick={() => setExpanded(!expanded)}
      >
        <div className={orderStyles.orderInfo}>
          <Text c="white" fw={800} size="xl" m={0}>
            Order #{order.id}
          </Text>
          <Text size="sm" style={{ color: 'var(--text-secondary)' }}>
            {formatDate(order.createdAt)} | {packCount} pack{packCount !== 1 ? 's' : ''}
          </Text>
          {order.trackingNumber && (
            <button
              type="button"
              className={orderStyles.tracking}
              onClick={handleTrackingClick}
            >
              <Truck size={14} />
              <Text size="sm" style={{ color: 'var(--text-muted)' }}>
                {order.trackingCarrier}: <span className={orderStyles.trackingNumber}>{order.trackingNumber}</span>
              </Text>
            </button>
          )}
        </div>
        <div className={orderStyles.orderRight}>
          <div className={orderStyles.priceRow}>
            <Text c="white" fw={800} size="xl" m={0}>
              {formatPrice(order.totalAmount)}
            </Text>
            {expanded ? <ChevronUp size={22} strokeWidth={2.5} /> : <ChevronDown size={22} strokeWidth={2.5} />}
          </div>
          <div className={orderStyles.statusRow}>
            <span
              className={orderStyles.statusDot}
              style={{ backgroundColor: STATUS_COLORS[order.status] }}
            />
            <Text size="sm" m={0} style={{ color: 'var(--text-muted)' }}>
              {STATUS_LABELS[order.status]}
            </Text>
          </div>
        </div>
      </button>

      {order.promoCode && order.discount > 0 && (
        <div className={orderStyles.promoCode}>
          <Text c="primaryLight" size="sm">
            ${(order.discount / 100).toFixed(0)} promo code applied ({order.promoCode})
          </Text>
        </div>
      )}

      <Collapse in={expanded} transitionDuration={200}>
        <div className={orderStyles.orderDetails}>
          <div className={orderStyles.packsList}>
            {order.lineItems.map((item) => (
              <OrderPackItem key={item.id} item={item} />
            ))}
          </div>

          <div className={orderStyles.summarySection}>
            <div className={orderStyles.summaryRow}>
              <Text c="dimmed" size="sm">Subtotal</Text>
              <Text c="white" size="sm">{formatPrice(subtotal)}</Text>
            </div>
            <div className={orderStyles.summaryRow}>
              <Text c="dimmed" size="sm">Shipping</Text>
              <Text c="white" size="sm">
                {order.totalAmount - subtotal === 0 ? 'Free' : formatPrice(order.totalAmount - subtotal)}
              </Text>
            </div>
            <div className={orderStyles.summaryRow}>
              <Text c="white" size="sm" fw={600}>Total</Text>
              <Text c="white" size="sm" fw={600}>{formatPrice(order.totalAmount)}</Text>
            </div>
          </div>

          {order.shippingAddress && (
            <div className={orderStyles.addressSection}>
              <Text c="dimmed" size="sm" fw={600} mb="xs">
                Shipping Address
              </Text>
              <Text c="white" size="sm">
                {order.shippingAddress.firstName} {order.shippingAddress.lastName}
              </Text>
              <Text c="dimmed" size="sm">
                {order.shippingAddress.addressLine1}
                {order.shippingAddress.addressLine2 && `, ${order.shippingAddress.addressLine2}`}
              </Text>
              <Text c="dimmed" size="sm">
                {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
              </Text>
            </div>
          )}
        </div>
      </Collapse>
    </div>
  );
}
