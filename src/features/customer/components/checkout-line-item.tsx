import { Text } from '@mantine/core';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

import { CardSidePreview } from '@/components/card-side-preview';
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
            <CardSidePreview
              card={firstCard}
              className={styles.thumbnailImage}
              badgeSize="xs"
            />
          ) : (
            <div className={styles.thumbnailPlaceholder} />
          )}
          <span className={styles.thumbnailBadge}>{totalCardCount}</span>
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
          <ChevronDown
            size={24}
            className={`${styles.chevron} ${isExpanded ? styles.open : ''}`}
          />
        </button>
      </div>

      <div
        className={`${styles.expandedContentWrapper} ${isExpanded ? styles.open : ''}`}
      >
        <div className={styles.expandedContent}>
          <div className={styles.expandedContentInner}>
            <div className={styles.cardsGrid}>
              {item.pack.packCards.map((packCard) => (
                <div key={packCard.cardId} className={styles.cardItem}>
                  <CardSidePreview
                    card={packCard.card}
                    className={styles.cardImage}
                    badgeSize="xs"
                  />
                  {packCard.quantity > 1 && (
                    <span className={styles.quantityBadge}>
                      {packCard.quantity}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className={styles.addMoreBanner}>
        <PackAddMoreBanner pack={item.pack} totalQuantity={totalCardCount} />
      </div>
    </div>
  );
}
