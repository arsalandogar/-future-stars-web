import { Container, Loader, Text, Title } from '@mantine/core';
import { Check } from 'lucide-react';

import { CardSidePreview } from '@/components/card-side-preview';
import { Head } from '@/components/seo/head';

import { type Order, useOrder } from '../api/get-order';

import styles from './order-success-page.module.css';

interface OrderSuccessPageProps {
  orderId: number;
}

type OrderCardPreview =
  Order['lineItems'][number]['packSnapshot']['cardSnapshots'][number];

function getCardPreviews(order: Order | undefined): OrderCardPreview[] {
  if (!order) return [];

  const previews: OrderCardPreview[] = [];
  const seen = new Set<number>();

  for (const item of order.lineItems) {
    for (const card of item.packSnapshot.cardSnapshots) {
      if (seen.has(card.id)) continue;
      seen.add(card.id);
      previews.push(card);
      if (previews.length >= 3) break;
    }
    if (previews.length >= 3) break;
  }

  if (previews.length === 0) return [];
  if (previews.length === 1) return [previews[0], previews[0], previews[0]];
  if (previews.length === 2) return [previews[0], previews[1], previews[0]];
  return previews.slice(0, 3);
}

function getOrderSummary(order: Order | undefined) {
  if (!order) return { packCount: 0, cardCount: 0, total: 0 };

  let cardCount = 0;
  for (const item of order.lineItems) {
    cardCount += item.packSnapshot.cardSnapshots.length * item.quantity;
  }

  return {
    packCount: order.lineItems.reduce((sum, item) => sum + item.quantity, 0),
    cardCount,
    total: order.totalAmount,
  };
}

export function OrderSuccessPage({ orderId }: OrderSuccessPageProps) {
  const { data: order, isLoading } = useOrder({ variables: orderId });

  const cardPreviews = getCardPreviews(order);
  const summary = getOrderSummary(order);

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <>
      <Head
        title="Order Confirmed"
        description="Your order has been placed successfully"
      />
      <Container size="xl" className={styles.container}>
        <Title order={1} c="white" fw={800} className={styles.pageTitle}>
          ORDER CONFIRMATION
        </Title>

        <div className={styles.content}>
          <div className={styles.topRow}>
            {/* Card Fan */}
            <div className={styles.cardFan}>
              {cardPreviews.length > 0 && (
                <>
                  <CardSidePreview
                    card={cardPreviews[0]}
                    className={`${styles.fanCard} ${styles.leftCard}`}
                    style={{ width: 'auto' }}
                  />
                  <CardSidePreview
                    card={cardPreviews[1]}
                    className={`${styles.fanCard} ${styles.centerCard}`}
                    style={{ width: 'auto' }}
                  />
                  <CardSidePreview
                    card={cardPreviews[2]}
                    className={`${styles.fanCard} ${styles.rightCard}`}
                    style={{ width: 'auto' }}
                  />
                </>
              )}
            </div>

            {/* Order Info */}
            <div className={styles.orderInfo}>
              <div className={styles.confirmedHeader}>
                <div className={styles.checkIcon}>
                  <Check size={28} strokeWidth={3} />
                </div>
                <Title order={2} c="white" fw={700}>
                  Order Confirmed!
                </Title>
              </div>

              <Text c="dimmed" size="lg" className={styles.thankYou}>
                Thank you, your order has been placed!
              </Text>

              <div className={styles.orderDetails}>
                <div className={styles.detailRow}>
                  <Text c="dimmed">Order #</Text>
                  <Text c="white" fw={600}>
                    {order?.id}
                  </Text>
                </div>
                <div className={styles.detailRow}>
                  <Text c="dimmed">
                    {summary.packCount} Pack{summary.packCount !== 1 ? 's' : ''}{' '}
                    ({summary.cardCount} Card
                    {summary.cardCount !== 1 ? 's' : ''})
                  </Text>
                  <Text c="white" fw={600}>
                    ${(summary.total / 100).toFixed(2)}
                  </Text>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </>
  );
}
