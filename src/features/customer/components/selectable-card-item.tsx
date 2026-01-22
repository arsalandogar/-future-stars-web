import { Image, Text } from '@mantine/core';
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

  const handleCardClick = () => {
    // Only allow selecting, not deselecting by clicking the card
    if (isSelected) return;
    if (disabled) return;
    onSelect();
  };

  const handleCheckClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(); // Deselect
  };

  return (
    <div
      className={`${styles.card} ${isSelected ? styles.selected : ''} ${disabled && !isSelected ? styles.disabled : ''}`}
      onClick={handleCardClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCardClick();
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
            <button
              type="button"
              className={styles.checkBadge}
              onClick={handleCheckClick}
            >
              <Check size={16} strokeWidth={3} />
            </button>

            <div className={styles.quantityPicker}>
              <button
                type="button"
                onClick={handleDecrement}
                className={styles.quantityButton}
              >
                <Minus size={22} />
              </button>
              <Text className={styles.quantityValue}>{quantity}</Text>
              <button
                type="button"
                onClick={handleIncrement}
                className={styles.quantityButton}
              >
                <Plus size={22} />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
