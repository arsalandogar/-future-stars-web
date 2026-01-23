import { Image } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

import type { CartItem as CartItemType } from '@/types';

import { formatDate } from '../utils/format-date';

import { CartItemQuantityPicker } from './cart-item-quantity-picker';
import styles from './cart-item.module.css';
import { PackAddMoreBanner } from './pack-add-more-banner';
import { PackCardsPreview } from './pack-cards-preview';

interface CartItemProps {
  item: CartItemType;
  quantity?: number;
  onQuantityChange?: (quantity: number) => void;
  onDelete?: () => void;
  onViewPack?: () => void;
  readOnly?: boolean;
}

function getTotalPackQuantity(item: CartItemType): number {
  return item.pack.packCards.reduce((sum, pc) => sum + pc.quantity, 0);
}

export function CartItem({
  item,
  quantity,
  onQuantityChange,
  onDelete,
  onViewPack,
  readOnly = false,
}: CartItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isMobile = useMediaQuery('(max-width: 576px)');

  const firstCard = item.pack.packCards[0]?.card;
  const hasMultipleCards = item.pack.packCards.length > 1;
  const totalPackQuantity = getTotalPackQuantity(item);

  return (
    <div className={`${styles.container} ${readOnly ? styles.readOnly : ''}`}>
      <div className={styles.mainContent}>
        <button type="button" className={styles.thumbnail} onClick={onViewPack}>
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
        </button>

        <div className={styles.info}>
          <div className={styles.titleRow}>
            <span className={styles.name}>{item.pack.name}</span>
            <span className={styles.price}>
              ${(item.totalPrice / 100).toFixed(2)}
            </span>
          </div>
          <div className={styles.dateRow}>
            <span className={styles.statusDot} />
            <span className={styles.dateText}>
              Created: {formatDate(item.pack.createdAt)}
            </span>
          </div>
          {!readOnly && (
            <div className={styles.actionsRow}>
              {hasMultipleCards && (
                <button
                  type="button"
                  className={styles.viewCardsButton}
                  onClick={() => setIsExpanded(!isExpanded)}
                >
                  <span>View Cards</span>
                  {isExpanded ? (
                    <ChevronUp size={isMobile ? 14 : 16} strokeWidth={3} />
                  ) : (
                    <ChevronDown size={isMobile ? 14 : 16} strokeWidth={3} />
                  )}
                </button>
              )}
              {quantity !== undefined && onQuantityChange && onDelete && (
                <div className={styles.quantityPicker}>
                  <CartItemQuantityPicker
                    value={quantity}
                    onChange={onQuantityChange}
                    onDelete={onDelete}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {!readOnly && isExpanded && (
        <div className={styles.expandedContent}>
          <PackCardsPreview cards={item.pack.packCards.map((pc) => pc.card)} />
        </div>
      )}

      <PackAddMoreBanner pack={item.pack} totalQuantity={totalPackQuantity} />
    </div>
  );
}
