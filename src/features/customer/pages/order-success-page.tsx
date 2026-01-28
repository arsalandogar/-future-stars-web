import { Container, Loader, Text, Title } from '@mantine/core';
import { Check } from 'lucide-react';

import { Head } from '@/components/seo/head';

import { type Order, useOrder } from '../api/get-order';

import styles from './order-success-page.module.css';

interface OrderSuccessPageProps {
  orderId: number;
}

function getCardImages(order: Order | undefined): string[] {
  if (!order) return [];

  const images: string[] = [];

  for (const item of order.lineItems) {
    for (const card of item.packSnapshot.cardSnapshots) {
      if (!images.includes(card.frontCardImage)) {
        images.push(card.frontCardImage);
      }
      if (images.length >= 3) break;
    }
    if (images.length >= 3) break;
  }

  // If we have fewer than 3 images, repeat to fill
  if (images.length === 0) return [];
  if (images.length === 1) return [images[0], images[0], images[0]];
  if (images.length === 2) return [images[0], images[1], images[0]];
  return images.slice(0, 3);
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

  const cardImages = getCardImages(order);
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
              {cardImages.length > 0 && (
                <>
                  <img
                    src={cardImages[0]}
                    alt="Card"
                    className={`${styles.fanCard} ${styles.leftCard}`}
                  />
                  <img
                    src={cardImages[1]}
                    alt="Card"
                    className={`${styles.fanCard} ${styles.centerCard}`}
                  />
                  <img
                    src={cardImages[2]}
                    alt="Card"
                    className={`${styles.fanCard} ${styles.rightCard}`}
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
