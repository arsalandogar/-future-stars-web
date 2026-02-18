import { Collapse, Image, Text } from '@mantine/core';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

import type { OrderLineItem } from '../api/get-orders';
import styles from './checkout-line-item.module.css';

interface OrderPackItemProps {
  item: OrderLineItem;
}

function getTotalCardCount(item: OrderLineItem): number {
  return item.packSnapshot.cardSnapshots.reduce(
    (sum, cs) => sum + cs.quantity,
    0
  );
}

export function OrderPackItem({ item }: OrderPackItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const firstCard = item.packSnapshot.cardSnapshots[0];
  const totalCardCount = getTotalCardCount(item);

  return (
    <div className={styles.container}>
      <div className={styles.mainContent}>
        <div className={styles.thumbnail}>
          {firstCard ? (
            <Image
              src={firstCard.frontCardImage}
              alt={item.packName}
              fit="cover"
              className={styles.thumbnailImage}
            />
          ) : (
            <div className={styles.thumbnailPlaceholder} />
          )}
        </div>

        <div className={styles.info}>
          <Text size="lg" className={styles.packName}>
            {item.packName || item.packSnapshot.name}{' '}
            <span className={styles.cardCount}>
              ({totalCardCount} {totalCardCount === 1 ? 'card' : 'cards'})
            </span>
          </Text>
        </div>

        <button
          type="button"
          className={styles.expandButton}
          onClick={() => setIsExpanded(!isExpanded)}
          aria-label={isExpanded ? 'Collapse' : 'Expand'}
        >
          {isExpanded ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
        </button>
      </div>

      <Collapse in={isExpanded}>
        <div className={styles.expandedContent}>
          <div className={styles.cardsGrid}>
            {item.packSnapshot.cardSnapshots.map((cardSnapshot) => (
              <div key={cardSnapshot.id} className={styles.cardItem}>
                <img
                  src={cardSnapshot.frontCardImage}
                  alt={`Card ${cardSnapshot.originalCardId}`}
                  className={styles.cardImage}
                />
                {cardSnapshot.quantity > 1 && (
                  <span className={styles.quantityBadge}>
                    x{cardSnapshot.quantity}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </Collapse>
    </div>
  );
}
