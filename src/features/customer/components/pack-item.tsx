import { ActionIcon, Button, Image, Text } from '@mantine/core';
import { ChevronDown, ChevronUp, MoreVertical } from 'lucide-react';
import { useState } from 'react';
import { MdOutlineShoppingCart } from 'react-icons/md';

import type { Pack } from '@/types';

import { PackAddMoreBanner } from './pack-add-more-banner';
import { PackCardsPreview } from './pack-cards-preview';
import styles from './pack-item.module.css';
import type { ViewMode } from './view-toggle';

interface PackItemProps {
  pack: Pack;
  variant: ViewMode;
  onAddToCart: (pack: Pack) => void;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
}

function getTotalQuantity(pack: Pack): number {
  return pack.packCards.reduce((sum, pc) => sum + pc.quantity, 0);
}

export function PackItem({ pack, variant, onAddToCart }: PackItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const firstCard = pack.packCards[0]?.card;
  const hasMultipleCards = pack.packCards.length > 1;
  const totalQuantity = getTotalQuantity(pack);

  return (
    <div className={`${styles.container} ${styles[variant]}`}>
      <div className={styles.mainContent}>
        <div className={styles.thumbnail}>
          {firstCard ? (
            <Image
              src={firstCard.frontCardImage}
              alt={pack.name}
              fit="cover"
              className={styles.thumbnailImage}
            />
          ) : (
            <div className={styles.thumbnailPlaceholder} />
          )}
        </div>

        <div className={styles.info}>
          <Text fw={600} size="lg" c="white" className={styles.name}>
            {pack.name}
          </Text>
          <div className={styles.dateRow}>
            <span className={styles.statusDot} />
            <Text size="sm" c="dimmed">
              Created: {formatDate(pack.createdAt)}
            </Text>
          </div>
          {hasMultipleCards && (
            <button
              type="button"
              className={styles.viewCardsButton}
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <span>View Cards</span>
              {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          )}
        </div>

        <div className={styles.actions}>
          <ActionIcon
            variant="transparent"
            size="lg"
            className={styles.menuButton}
          >
            <MoreVertical size={20} />
          </ActionIcon>
          <Button
            variant="outline"
            size="sm"
            radius="xl"
            leftSection={<MdOutlineShoppingCart size={16} />}
            onClick={() => onAddToCart(pack)}
            className={styles.addToCartButton}
          >
            Add to Cart
          </Button>
        </div>
      </div>

      {isExpanded && (
        <div className={styles.expandedContent}>
          <PackCardsPreview cards={pack.packCards.map((pc) => pc.card)} />
        </div>
      )}

      <PackAddMoreBanner totalQuantity={totalQuantity} />
    </div>
  );
}
