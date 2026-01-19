import { ActionIcon, Image, Text } from '@mantine/core';
import { Check, Minus, Plus } from 'lucide-react';

import type { Card } from '@/types';

import styles from './selectable-card-item.module.css';

interface SelectableCardItemProps {
  card: Card;
  isSelected: boolean;
  quantity: number;
  onSelect: () => void;
  onQuantityChange: (quantity: number) => void;
  disabled?: boolean;
}

export function SelectableCardItem({
  card,
  isSelected,
  quantity,
  onSelect,
  onQuantityChange,
  disabled = false,
}: SelectableCardItemProps) {
  const handleDecrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (quantity > 0) {
      onQuantityChange(quantity - 1);
    }
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    onQuantityChange(quantity + 1);
  };

  const handleClick = () => {
    if (disabled && !isSelected) return;
    onSelect();
  };

  return (
    <div
      className={`${styles.card} ${isSelected ? styles.selected : ''} ${disabled && !isSelected ? styles.disabled : ''}`}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
      role="button"
      tabIndex={0}
    >
      <div className={styles.imageContainer}>
        <Image
          src={card.frontCardImage}
          alt="Card"
          fit="cover"
          className={styles.image}
        />

        {isSelected && (
          <>
            <div className={styles.checkBadge}>
              <Check size={16} strokeWidth={3} />
            </div>

            <div className={styles.quantityPicker}>
              <ActionIcon
                variant="transparent"
                size="sm"
                onClick={handleDecrement}
                className={styles.quantityButton}
              >
                <Minus size={16} />
              </ActionIcon>
              <Text className={styles.quantityValue}>{quantity}</Text>
              <ActionIcon
                variant="transparent"
                size="sm"
                onClick={handleIncrement}
                className={styles.quantityButton}
              >
                <Plus size={16} />
              </ActionIcon>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
