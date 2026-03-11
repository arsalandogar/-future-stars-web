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
              imageUrl={firstCard.frontCardImage}
              svgString={firstCard.svgString}
              status={firstCard.status}
              alt={item.pack.name}
              className={styles.thumbnailImage}
              badgeSize="xs"
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
                    imageUrl={packCard.card.frontCardImage}
                    svgString={packCard.card.svgString}
                    status={packCard.card.status}
                    alt={`Card ${packCard.cardId}`}
                    className={styles.cardImage}
                    badgeSize="xs"
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
        </div>
      </div>

      <div className={styles.addMoreBanner}>
        <PackAddMoreBanner pack={item.pack} totalQuantity={totalCardCount} />
      </div>
    </div>
  );
}
