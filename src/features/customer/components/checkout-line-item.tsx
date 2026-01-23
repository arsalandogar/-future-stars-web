import { Image, Text } from '@mantine/core';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

import type { CartItem } from '@/types';

import styles from './checkout-line-item.module.css';
import { PackAddMoreBanner } from './pack-add-more-banner';

interface CheckoutLineItemProps {
  item: CartItem;
}

function getTotalCardCount(item: CartItem): number {
  return item.pack.packCards.reduce((sum, pc) => sum + pc.quantity, 0);
}

export function CheckoutLineItem({ item }: CheckoutLineItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const firstCard = item.pack.packCards[0]?.card;
  const totalCardCount = getTotalCardCount(item);

  return (
    <div className={styles.container}>
      <div className={styles.mainContent}>
        <div className={styles.thumbnail}>
          {firstCard ? (
            <Image
              src={firstCard.frontCardImage}
              alt={item.pack.name}
              fit="cover"
              className={styles.thumbnailImage}
            />
          ) : (
            <div className={styles.thumbnailPlaceholder} />
          )}
        </div>

        <div className={styles.info}>
          <Text size="lg" className={styles.packName}>
            {item.pack.name}{' '}
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

      {isExpanded && (
        <div className={styles.expandedContent}>
          <div className={styles.cardsGrid}>
            {item.pack.packCards.map((packCard) => (
              <div key={packCard.cardId} className={styles.cardItem}>
                <img
                  src={packCard.card.frontCardImage}
                  alt={`Card ${packCard.cardId}`}
                  className={styles.cardImage}
                />
                {packCard.quantity > 1 && (
                  <span className={styles.quantityBadge}>
                    x{packCard.quantity}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className={styles.addMoreBanner}>
        <PackAddMoreBanner pack={item.pack} totalQuantity={totalCardCount} />
      </div>
    </div>
  );
}
